import { makeAutoObservable } from "mobx";

import type { Position, Size } from "@/shared/types/types";
import type { Drawable } from "@/store/entity/drawable/drawable.ts";
import { SelectionBox } from "@/store/entity/selection/selectionBox/selectionBox.ts";
import { SelectionHover } from "@/store/entity/selection/selectionHover/selectionHover.ts";
import type { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";

type ResizeHandle = "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

const CURSOR: Record<ResizeHandle | "move" | "default", string> = {
	top: "ns-resize",
	bottom: "ns-resize",
	left: "ew-resize",
	right: "ew-resize",
	"top-left": "nwse-resize",
	"top-right": "nesw-resize",
	"bottom-left": "nesw-resize",
	"bottom-right": "nwse-resize",
	move: "move",
	default: "default",
};

interface ContentBounds {
	left: number;
	right: number;
	bottom: number;
	top: number;
}

interface ResizeStartBox extends ContentBounds {
	width: number;
	height: number;
}

interface DrawableSnapshot {
	drawable: Drawable;
	position: Position | null;
	size: Size | null;
}

/**
 * Manages selection state including:
 * - Selected drawables
 * - Selection preview (dynamic mouse rectangle)
 * - Selection box (persistent box around selected items)
 * - Resize operations (dragging edges/corners of selection box)
 */
export class SelectionStore {
	/*
	S░░░░░░░░░░░░░░░░░ SelectionBox.borderWidth ░░░░░░░░░░░░░░░░░░░
	░                    SelectionBox.padding                     ░
	░  E█████████████████ Entity.borderWidth ███████████████████  ░
	░  █                                                       █  ░
	░  █                        CONTENT                        █  ░
	░  █                                                       █  ░
	░  █████████████████████████████████████████████████████████  ░
	░                                                             ░
	░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

	E - Entity.position
	S - SelectionBox.position
	BORDER INCLUSIVE: Entity.position and Entity.size define the position and size of the entity WITH BORDER on the scene
	*/
	private readonly selectionPrecision = 5; // hit-test precision in scene pixels

	private _drawables: Drawable[] = [];
	private _selectionPreview: SelectionPreview | null = null;
	private _selectionHover: SelectionHover = new SelectionHover();
	private _zoom = 1;

	// Resize state: active only during edge/corner drag
	private _resizeHandle: ResizeHandle | null = null;
	private _resizeStartBox: ResizeStartBox | null = null;
	private _resizeStartSnapshots: DrawableSnapshot[] = [];
	private _resizeCursor: Position | null = null;
	private _resizeGrabOffset: Position | null = null;

	// Move state: active when dragging selection
	private _isMoving = false;

	constructor() {
		makeAutoObservable(this, {}, { autoBind: true });
	}

	// ========== Selection management ==========

	get drawables() {
		return this._drawables;
	}

	set drawables(value) {
		this._drawables = value;
	}

	add(drawable: Drawable) {
		this.drawables.push(drawable);
	}

	addMany(drawables: Drawable[]) {
		this.drawables.push(...drawables);
	}

	delete(drawable: Drawable) {
		this.drawables = this.drawables.filter(d => d !== drawable);
	}

	// ========== Selection preview (mouse drag) ==========

	get selectionPreview() {
		return this._selectionPreview;
	}

	set selectionPreview(value) {
		this._selectionPreview = value;
	}

	// ========== Selection hover (mouse over drawable) ==========

	get selectionHover() {
		return this._selectionHover;
	}

	// ========== Zoom state ==========

	get zoom() {
		return this._zoom;
	}

	set zoom(value) {
		this._zoom = value;
		this._selectionHover.zoom = value;
	}

	// ========== Selection box (around selected drawables) ==========

	/**
	 * Computes the selection box that wraps all selected drawables.
	 * During resize, uses the start box + current cursor position.
	 * Otherwise, calculates from current drawable positions.
	 */
	get selectionBox(): SelectionBox | null {
		if (this.drawables.length === 0) return null;

		const box = new SelectionBox();
		box.zoom = this.zoom;
		box.borderWidth /= this.zoom;
		box.padding /= this.zoom;

		let contentBounds: ContentBounds;

		if (this.isResizing && this._resizeStartBox && this._resizeHandle && this._resizeCursor) {
			// During resize: compute from start box + dragged edge/corner
			contentBounds = this.getContentBoundsDuringResize();
		} else {
			// Normal mode: compute from current drawable positions
			contentBounds = this.getContentBoundsFromDrawables();
		}

		// Convert content bounds to selection box outer bounds (add border + padding)
		const { position, size } = this.convertContentToSelectionBox(contentBounds, box.borderWidth, box.padding);
		box.position = position;
		box.size = size;

		return box;
	}

	/**
	 * Hit-test: checks if cursor is near an edge or corner of the selection box.
	 * Returns the handle type (e.g., "top-left", "right") or null.
	 */
	getPositionOnEdgeOfSelection(sceneCoordinates: Position): ResizeHandle | null {
		const box = this.selectionBox;
		if (!box || !box.position || !box.size) return null;

		const precisionScene = this.selectionPrecision / this.zoom;
		const left = box.position.x + box.borderWidth / 2;
		const right = box.position.x + box.size.width - box.borderWidth / 2;
		const bottom = box.position.y + box.borderWidth / 2;
		const top = box.position.y + box.size.height - box.borderWidth / 2;
		const { x, y } = sceneCoordinates;

		const nearLeft = Math.abs(x - left) <= precisionScene;
		const nearRight = Math.abs(x - right) <= precisionScene;
		const nearBottom = Math.abs(y - bottom) <= precisionScene;
		const nearTop = Math.abs(y - top) <= precisionScene;
		const withinY = y >= bottom - precisionScene && y <= top + precisionScene;
		const withinX = x >= left - precisionScene && x <= right + precisionScene;

		// Corners take priority over edges
		if (nearLeft && nearTop && withinX && withinY) return "top-left";
		if (nearRight && nearTop && withinX && withinY) return "top-right";
		if (nearLeft && nearBottom && withinX && withinY) return "bottom-left";
		if (nearRight && nearBottom && withinX && withinY) return "bottom-right";

		// Edges
		if (nearLeft && withinY) return "left";
		if (nearRight && withinY) return "right";
		if (nearTop && withinX) return "top";
		if (nearBottom && withinX) return "bottom";

		return null;
	}

	/**
	 * Checks if a position is inside the selection box (excluding edges/corners for resize).
	 */
	isPositionInsideSelection(sceneCoordinates: Position): boolean {
		if (this.drawables.length === 0) return false;

		const box = this.selectionBox;
		if (!box || !box.position || !box.size) return false;

		// Check if inside the selection box
		const { position, size } = box;
		const isInside =
			sceneCoordinates.x >= position.x &&
			sceneCoordinates.x <= position.x + size.width &&
			sceneCoordinates.y >= position.y &&
			sceneCoordinates.y <= position.y + size.height;

		if (!isInside) return false;

		// Exclude edges/corners (those are for resize)
		const edge = this.getPositionOnEdgeOfSelection(sceneCoordinates);
		return edge === null;
	}

	/**
	 * Returns the appropriate cursor type for the current mouse position.
	 * Used to provide visual feedback for resize/move operations.
	 */
	getCursor(sceneCoordinates: Position): string {
		// During resize, show the resize cursor
		if (this.isResizing && this._resizeHandle) {
			return CURSOR[this._resizeHandle];
		}

		// Check if mouse is over selection edge/corner
		const handle = this.getPositionOnEdgeOfSelection(sceneCoordinates);
		if (handle) {
			return CURSOR[handle];
		}

		// Check if mouse is inside selection box (for move)
		if (this.isPositionInsideSelection(sceneCoordinates)) {
			return CURSOR.move;
		}

		// Default cursor
		return CURSOR.default;
	}

	// ========== Resize operations ==========

	get isResizing() {
		return this._resizeHandle !== null;
	}

	get isMoving() {
		return this._isMoving;
	}

	/**
	 * Begins a resize operation when user grabs an edge/corner.
	 * Captures the start state and grab offset to prevent cursor snap.
	 */
	startResize(handle: ResizeHandle, cursor: Position) {
		const box = this.selectionBox;
		if (!box || !box.position || !box.size) return;

		this._resizeHandle = handle;

		// Compute content boundaries (excluding border & padding)
		const left = box.position.x + box.borderWidth + box.padding;
		const right = box.position.x + box.size.width - box.borderWidth - box.padding;
		const bottom = box.position.y + box.borderWidth + box.padding;
		const top = box.position.y + box.size.height - box.borderWidth - box.padding;

		this._resizeStartBox = {
			left,
			right,
			bottom,
			top,
			width: Math.max(0, right - left),
			height: Math.max(0, top - bottom),
		};

		// Capture grab offset so edge stays under cursor (no initial snap)
		this._resizeGrabOffset = this.computeGrabOffset(handle, { left, right, bottom, top }, cursor);

		// Snapshot all drawable positions/sizes before resize
		this._resizeStartSnapshots = this.drawables.map(d => ({
			drawable: d,
			position: d.position ? { ...d.position } : null,
			size: d.size ? { ...d.size } : null,
		}));
	}

	/**
	 * Updates drawable positions/sizes during resize as cursor moves.
	 */
	updateResize(cursor: Position) {
		if (!this._resizeHandle || !this._resizeStartBox) return;

		this._resizeCursor = cursor;
		const adjustedCursor = this.getAdjustedCursor(cursor);
		const { anchorX, anchorY, scaleX, scaleY } = this.computeScales(
			this._resizeHandle,
			this._resizeStartBox,
			adjustedCursor,
		);

		// Apply scaling to all drawables from their original snapshots
		this._resizeStartSnapshots.forEach(snap => {
			this.applyScaleToSnapshot(snap, anchorX, anchorY, scaleX, scaleY);
		});
	}

	/**
	 * Ends the resize operation, clearing all resize state.
	 * Final geometry is already set by last updateResize call.
	 */
	endResize() {
		this._resizeHandle = null;
		this._resizeStartBox = null;
		this._resizeStartSnapshots = [];
		this._resizeCursor = null;
		this._resizeGrabOffset = null;
	}

	// ========== Move operations ==========

	/**
	 * Begins a move operation when user clicks inside selection box.
	 */
	startMove() {
		this._isMoving = true;
	}

	/**
	 * Ends the move operation.
	 */
	endMove() {
		this._isMoving = false;
	}

	// ========== Private helpers ==========

	/**
	 * Computes content bounds during resize from start box + current cursor.
	 */
	private getContentBoundsDuringResize(): ContentBounds {
		if (!this._resizeStartBox || !this._resizeHandle || !this._resizeCursor) {
			throw new Error("getContentBoundsDuringResize called without active resize");
		}

		const { left, right, bottom, top } = this._resizeStartBox;
		const adj = this.getAdjustedCursor(this._resizeCursor);

		// Replace the dragged edge/corner coordinate with cursor position
		const bounds: ContentBounds = {
			left: this._resizeHandle.includes("left") ? adj.x : left,
			right: this._resizeHandle.includes("right") ? adj.x : right,
			bottom: this._resizeHandle.includes("bottom") ? adj.y : bottom,
			top: this._resizeHandle.includes("top") ? adj.y : top,
		};

		// Normalize (handle negative sizes from dragging past opposite edge)
		return {
			left: Math.min(bounds.left, bounds.right),
			right: Math.max(bounds.left, bounds.right),
			bottom: Math.min(bounds.bottom, bounds.top),
			top: Math.max(bounds.bottom, bounds.top),
		};
	}

	/**
	 * Computes content bounds from current positions of all drawables.
	 */
	private getContentBoundsFromDrawables(): ContentBounds {
		let left = Infinity;
		let right = -Infinity;
		let bottom = Infinity;
		let top = -Infinity;

		for (const d of this.drawables) {
			if (!d.position || !d.size) continue;
			left = Math.min(left, d.position.x);
			right = Math.max(right, d.position.x + d.size.width);
			bottom = Math.min(bottom, d.position.y);
			top = Math.max(top, d.position.y + d.size.height);
		}

		return { left, right, bottom, top };
	}

	/**
	 * Converts content bounds to selection box outer bounds (adds border + padding).
	 */
	private convertContentToSelectionBox(
		content: ContentBounds,
		borderWidth: number,
		padding: number,
	): { position: Position; size: Size } {
		return {
			position: {
				x: content.left - borderWidth - padding,
				y: content.bottom - borderWidth - padding,
			},
			size: {
				width: content.right - content.left + 2 * borderWidth + 2 * padding,
				height: content.top - content.bottom + 2 * borderWidth + 2 * padding,
			},
		};
	}

	/**
	 * Computes grab offset when starting resize to keep edge under cursor.
	 */
	private computeGrabOffset(handle: ResizeHandle, bounds: ContentBounds, cursor: Position): Position {
		let offsetX = 0;
		let offsetY = 0;

		if (handle.includes("left")) offsetX = cursor.x - bounds.left;
		if (handle.includes("right")) offsetX = cursor.x - bounds.right;
		if (handle.includes("bottom")) offsetY = cursor.y - bounds.bottom;
		if (handle.includes("top")) offsetY = cursor.y - bounds.top;

		return { x: offsetX, y: offsetY };
	}

	/**
	 * Adjusts cursor by subtracting grab offset.
	 */
	private getAdjustedCursor(cursor: Position): Position {
		const offX = this._resizeGrabOffset?.x ?? 0;
		const offY = this._resizeGrabOffset?.y ?? 0;
		return { x: cursor.x - offX, y: cursor.y - offY };
	}

	/**
	 * Computes scale factors and anchor point based on resize handle.
	 */
	private computeScales(handle: ResizeHandle, startBox: ResizeStartBox, adjustedCursor: Position) {
		const { left, right, bottom, top, width, height } = startBox;
		let scaleX = 1;
		let scaleY = 1;
		let anchorX = left;
		let anchorY = bottom;

		// Horizontal scaling
		if (handle.includes("left")) {
			anchorX = right; // anchor on right edge
			scaleX = width > 0 ? (right - adjustedCursor.x) / width : 1;
		} else if (handle.includes("right")) {
			anchorX = left; // anchor on left edge
			scaleX = width > 0 ? (adjustedCursor.x - left) / width : 1;
		}

		// Vertical scaling
		if (handle.includes("bottom")) {
			anchorY = top; // anchor on top edge
			scaleY = height > 0 ? (top - adjustedCursor.y) / height : 1;
		} else if (handle.includes("top")) {
			anchorY = bottom; // anchor on bottom edge
			scaleY = height > 0 ? (adjustedCursor.y - bottom) / height : 1;
		}

		return { anchorX, anchorY, scaleX, scaleY };
	}

	/**
	 * Scales a drawable's snapshot around an anchor point and updates the drawable.
	 */
	private applyScaleToSnapshot(
		snap: DrawableSnapshot,
		anchorX: number,
		anchorY: number,
		scaleX: number,
		scaleY: number,
	) {
		if (!snap.position || !snap.size) return;

		const scaleAround = (value: number, anchor: number, scale: number) => anchor + (value - anchor) * scale;

		// Scale both corners of the rectangle
		const x1 = snap.position.x;
		const x2 = snap.position.x + snap.size.width;
		const y1 = snap.position.y;
		const y2 = snap.position.y + snap.size.height;

		const x1Scaled = scaleAround(x1, anchorX, scaleX);
		const x2Scaled = scaleAround(x2, anchorX, scaleX);
		const y1Scaled = scaleAround(y1, anchorY, scaleY);
		const y2Scaled = scaleAround(y2, anchorY, scaleY);

		// Normalize (handle negative sizes)
		const newLeft = Math.min(x1Scaled, x2Scaled);
		const newRight = Math.max(x1Scaled, x2Scaled);
		const newBottom = Math.min(y1Scaled, y2Scaled);
		const newTop = Math.max(y1Scaled, y2Scaled);

		snap.drawable.position = { x: newLeft, y: newBottom };
		snap.drawable.size = { width: newRight - newLeft, height: newTop - newBottom };
	}
}
