import type { Position } from "@/shared/types/types";
import type { DrawableStore } from "@/store/drawableStore.ts";
import type { Drawable } from "@/store/entity/drawable/drawable.ts";
import { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";
import type { SceneStore } from "@/store/sceneStore.ts";
import type { SelectionStore } from "@/store/selectionStore.ts";

type ResizeHandle = "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export class SelectionOperation {
	private selectionStore: SelectionStore;
	private drawableStore: DrawableStore;
	private sceneStore: SceneStore;

	constructor(selectionStore: SelectionStore, drawableStore: DrawableStore, sceneStore: SceneStore) {
		this.sceneStore = sceneStore;
		this.drawableStore = drawableStore;
		this.selectionStore = selectionStore;
	}

	// ========== Selection management ==========

	/**
	 * Selects a single drawable and prepares for move.
	 */
	selectAndStartMove(drawable: Drawable) {
		this.selectionStore.add(drawable);
		this.selectionStore.startMove();
	}

	/**
	 * Removes a drawable from selection.
	 */
	removeFromSelection(drawable: Drawable) {
		this.selectionStore.delete(drawable);
	}

	/**
	 * Clears all selection.
	 */
	clearSelection() {
		this.selectionStore.drawables = [];
	}

	/**
	 * Deletes selected drawables from the canvas.
	 */
	deleteSelected() {
		this.drawableStore.deleteDrawables(this.selectionStore.drawables);
		this.selectionStore.drawables = [];
		this.selectionStore.selectionHover.drawable = null;
	}

	// ========== Selection preview (drag to select) ==========

	/**
	 * Starts a selection preview at the given position.
	 */
	startSelectionPreview(sceneCoordinates: Position) {
		const preview = new SelectionPreview();
		preview.position = sceneCoordinates;
		preview.borderWidth /= this.sceneStore.zoom;
		this.selectionStore.selectionPreview = preview;
		this.sceneStore.mouseDown = sceneCoordinates;
	}

	/**
	 * Updates the selection preview as the mouse moves.
	 */
	updateSelectionPreview(sceneCoordinates: Position) {
		const { selectionPreview } = this.selectionStore;
		const { mouseDown } = this.sceneStore;

		if (!selectionPreview || !selectionPreview.position || !mouseDown) return;

		selectionPreview.position = { ...mouseDown };
		selectionPreview.size = {
			width: sceneCoordinates.x - selectionPreview.position.x,
			height: sceneCoordinates.y - selectionPreview.position.y,
		};
		selectionPreview.normalize();
	}

	/**
	 * Finishes the selection preview and selects all drawables within it.
	 */
	finishSelectionPreview(shiftKey: boolean) {
		const { selectionPreview } = this.selectionStore;
		if (!selectionPreview) return;

		selectionPreview.normalize();
		const selectedDrawables = this.drawableStore.getDrawablesInRectangle(selectionPreview);

		if (shiftKey) {
			this.selectionStore.addMany(selectedDrawables);
		} else {
			this.selectionStore.drawables = selectedDrawables;
		}

		this.sceneStore.mouseDown = null;
		this.selectionStore.selectionPreview = null;
	}

	/**
	 * Checks if selection preview is active.
	 */
	isSelectionPreviewActive(): boolean {
		return this.selectionStore.selectionPreview !== null;
	}

	// ========== Move operations ==========

	/**
	 * Starts moving the current selection.
	 */
	startMove() {
		this.selectionStore.startMove();
	}

	/**
	 * Updates position of all selected drawables.
	 */
	updateMove(movementX: number, movementY: number) {
		const { drawables } = this.selectionStore;
		const { zoom } = this.sceneStore;

		drawables.forEach(entity => {
			if (entity.position) {
				entity.position = {
					x: entity.position.x + movementX / zoom,
					y: entity.position.y + movementY / zoom,
				};
			}
		});
	}

	/**
	 * Finishes moving operation.
	 * If it was a click (no movement), handles single selection from group.
	 */
	finishMove(sceneCoordinates: Position, shiftKey: boolean) {
		const { mouseDown } = this.sceneStore;
		const { drawables } = this.selectionStore;

		// Check if it was a click (no mouse movement)
		const wasClick = mouseDown && sceneCoordinates.x === mouseDown.x && sceneCoordinates.y === mouseDown.y;

		if (wasClick && !shiftKey && drawables.length > 1) {
			// Click on one drawable from group → select only that one
			const drawableUnderCursor = this.drawableStore.getDrawableAtPosition(sceneCoordinates);
			if (drawableUnderCursor && drawables.includes(drawableUnderCursor)) {
				this.selectionStore.drawables = [drawableUnderCursor];
			}
		}

		this.selectionStore.endMove();
		this.sceneStore.mouseDown = null;
	}

	/**
	 * Checks if a move operation is in progress.
	 */
	isMoving(): boolean {
		return this.selectionStore.isMoving;
	}

	// ========== Resize operations ==========

	/**
	 * Starts resizing the selection from the given edge/corner.
	 */
	startResize(edge: ResizeHandle, sceneCoordinates: Position) {
		this.selectionStore.startResize(edge, sceneCoordinates);
		this.sceneStore.mouseDown = sceneCoordinates;
	}

	/**
	 * Updates the resize operation as the mouse moves.
	 */
	updateResize(sceneCoordinates: Position) {
		this.selectionStore.updateResize(sceneCoordinates);
	}

	/**
	 * Finishes the resize operation.
	 */
	finishResize() {
		this.selectionStore.endResize();
	}

	/**
	 * Checks if a resize operation is in progress.
	 */
	isResizing(): boolean {
		return this.selectionStore.isResizing;
	}

	// ========== Helper methods ==========

	/**
	 * Checks if the position is on an edge of the selection box.
	 */
	getEdgeAtPosition(sceneCoordinates: Position): ResizeHandle | null {
		return this.selectionStore.getPositionOnEdgeOfSelection(sceneCoordinates);
	}

	/**
	 * Checks if the position is inside the selection box.
	 */
	isPositionInsideSelection(sceneCoordinates: Position): boolean {
		return this.selectionStore.isPositionInsideSelection(sceneCoordinates);
	}

	/**
	 * Updates hover highlight based on mouse position.
	 */
	updateHover(sceneCoordinates: Position) {
		this.selectionStore.selectionHover.drawable = this.drawableStore.getDrawableAtPosition(sceneCoordinates);
	}

	/**
	 * Clears hover highlight.
	 */
	clearHover() {
		this.selectionStore.selectionHover.drawable = null;
	}

	/**
	 * Gets the appropriate cursor for the current position and state.
	 */
	getCursor(sceneCoordinates: Position): string {
		return this.selectionStore.getCursor(sceneCoordinates);
	}
}
