import type { DrawingOperation } from "@/core/operations/drawingOperation.ts";
import type { SelectionOperation } from "@/core/operations/selectionOperation.ts";
import type { DrawableStore } from "@/store/drawableStore.ts";
import { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";
import type { SceneStore } from "@/store/sceneStore.ts";
import type { SelectionStore } from "@/store/selectionStore.ts";

export class MouseController {
	private canvas: HTMLCanvasElement;
	private drawingOperation: DrawingOperation;
	private selectionOperation: SelectionOperation;
	private drawableStore: DrawableStore;
	private selectionStore: SelectionStore;
	private sceneStore: SceneStore;
	private abortController = new AbortController();

	constructor(
		canvas: HTMLCanvasElement,
		drawingOperation: DrawingOperation,
		selectionOperation: SelectionOperation,
		drawableStore: DrawableStore,
		selectionStore: SelectionStore,
		sceneStore: SceneStore,
	) {
		this.canvas = canvas;
		this.drawingOperation = drawingOperation;
		this.selectionOperation = selectionOperation;
		this.drawableStore = drawableStore;
		this.selectionStore = selectionStore;
		this.sceneStore = sceneStore;
	}

	init() {
		const signal = this.abortController.signal;

		this.canvas.addEventListener("mousedown", this.handleMouseDown, { signal });
		this.canvas.addEventListener("mousemove", this.handleMouseMove, { signal });
		this.canvas.addEventListener("mouseup", this.handleMouseUp, { signal });
		this.canvas.addEventListener("contextmenu", this.handleContextMenu, { signal });
	}

	destroy() {
		this.abortController.abort();
	}

	private handleMouseDown = (e: MouseEvent) => {
		const sceneCoordinates = this.sceneStore.getSceneCoordinates(e);
		const drawableUnderCursor = this.drawableStore.getDrawableAtPosition(sceneCoordinates);
		this.sceneStore.mouseDown = sceneCoordinates;

		// Mouse down on the edge of selection → start resize
		const edge = this.selectionOperation.getEdgeAtPosition(sceneCoordinates);
		if (edge) {
			this.selectionOperation.startResize(edge, sceneCoordinates);
			return;
		}

		// Mouse down inside selection box (not on edge) → prepare for move
		const isInsideSelection = this.selectionOperation.isPositionInsideSelection(sceneCoordinates);
		if (isInsideSelection) {
			// Shift + mousedown inside selection on specific drawable → remove from selection
			if (e.shiftKey && drawableUnderCursor && this.selectionStore.drawables.includes(drawableUnderCursor)) {
				this.selectionOperation.removeFromSelection(drawableUnderCursor);
				return;
			}
			// Start move operation (keep hover active)
			this.selectionOperation.startMove();
			return;
		}

		// Clear selection if not holding shift
		if (!e.shiftKey) {
			this.selectionOperation.clearSelection();
		}

		// Mouse down on not selected entity
		if (drawableUnderCursor) {
			this.selectionOperation.selectAndStartMove(drawableUnderCursor);
			return;
		}

		// Mouse down on empty space + selection tool
		if (this.sceneStore.tool === SelectionPreview.type) {
			this.selectionOperation.startSelectionPreview(sceneCoordinates);
			return;
		}

		// Mouse down on empty space → start drawing
		this.drawingOperation.start(sceneCoordinates);
	};

	private handleMouseMove = (e: MouseEvent) => {
		const isMainMouseButtonPressed = e.buttons === 1;
		const sceneCoordinates = this.sceneStore.getSceneCoordinates(e);

		// Update cursor based on position and state
		this.canvas.style.cursor = this.selectionOperation.getCursor(sceneCoordinates);

		// Update hover highlight (when not drawing or selecting)
		if (!this.drawingOperation.isDrawing() && !this.selectionOperation.isSelectionPreviewActive()) {
			this.selectionOperation.updateHover(sceneCoordinates);
		}

		if (!isMainMouseButtonPressed) return;

		// Regular drawing
		if (this.drawingOperation.isDrawing()) {
			this.drawingOperation.update(sceneCoordinates);
			return;
		}

		// Selection preview
		if (this.selectionOperation.isSelectionPreviewActive()) {
			this.selectionOperation.updateSelectionPreview(sceneCoordinates);
			return;
		}

		// Selection box resize
		if (this.selectionOperation.isResizing()) {
			this.selectionOperation.updateResize(sceneCoordinates);
			return;
		}

		// Move selected drawables
		if (this.selectionOperation.isMoving()) {
			this.selectionOperation.updateMove(e.movementX, -e.movementY);
			return;
		}
	};

	private handleMouseUp = (e: MouseEvent) => {
		const sceneCoordinates = this.sceneStore.getSceneCoordinates(e);

		// Regular drawing finished
		if (this.drawingOperation.isDrawing()) {
			this.drawingOperation.finish();
			return;
		}

		// Selection preview finished
		if (this.selectionOperation.isSelectionPreviewActive()) {
			this.selectionOperation.finishSelectionPreview(e.shiftKey);
			return;
		}

		// Selection box resize finished
		if (this.selectionOperation.isResizing()) {
			this.selectionOperation.finishResize();
			return;
		}

		// Move finished
		if (this.selectionOperation.isMoving()) {
			this.selectionOperation.finishMove(sceneCoordinates, e.shiftKey);
			return;
		}

		// No active operation
		this.sceneStore.mouseDown = null;
	};

	private handleContextMenu = (e: MouseEvent) => {
		e.preventDefault();
	};
}
