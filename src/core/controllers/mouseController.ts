import type { DrawingOperation } from "@/core/operations/drawingOperation.ts";
import type { SelectionOperation } from "@/core/operations/selectionOperation.ts";
import type { Disposable } from "@/shared/types/types";
import { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";
import type { RootStore } from "@/store/rootStore.ts";

export class MouseController implements Disposable {
	private canvas: HTMLCanvasElement;
	private drawingOperation: DrawingOperation;
	private selectionOperation: SelectionOperation;
	private rootStore: RootStore;
	private abortController = new AbortController();

	constructor(
		canvas: HTMLCanvasElement,
		drawingOperation: DrawingOperation,
		selectionOperation: SelectionOperation,
		rootStore: RootStore,
	) {
		this.canvas = canvas;
		this.drawingOperation = drawingOperation;
		this.selectionOperation = selectionOperation;
		this.rootStore = rootStore;
	}

	init() {
		const signal = this.abortController.signal;

		this.canvas.addEventListener("mousedown", this.handleMouseDown, { signal });
		this.canvas.addEventListener("mousemove", this.handleMouseMove, { signal });
		this.canvas.addEventListener("mouseup", this.handleMouseUp, { signal });
		this.canvas.addEventListener("contextmenu", this.handleContextMenu, { signal });
	}

	dispose() {
		this.abortController.abort();
	}

	private handleMouseDown = (e: MouseEvent) => {
		const sceneCoordinatesUnsnapped = this.rootStore.sceneStore.getSceneCoordinates(e);
		const sceneCoordinates = this.rootStore.sceneStore.getSceneCoordinates(e, true);
		const drawableUnderCursor = this.rootStore.drawableStore.getDrawableAtPosition(sceneCoordinates);
		this.rootStore.sceneStore.mouseDown = sceneCoordinates;

		// Mouse down on the edge of selection → start resize
		const edge = this.selectionOperation.getEdgeAtPosition(sceneCoordinatesUnsnapped);
		if (edge) {
			this.selectionOperation.startResize(edge, sceneCoordinates);
			return;
		}

		// Mouse down inside selection box (not on edge) → prepare for move
		const isInsideSelection = this.selectionOperation.isPositionInsideSelection(sceneCoordinates);
		if (isInsideSelection) {
			// Shift + mousedown inside selection on specific drawable → remove from selection
			if (
				e.shiftKey &&
				drawableUnderCursor &&
				this.rootStore.selectionStore.drawables.includes(drawableUnderCursor)
			) {
				this.selectionOperation.removeFromSelection(drawableUnderCursor);
				return;
			}
			// Start move operation (keep hover active)
			this.selectionOperation.startMove(sceneCoordinates);
			return;
		}

		// Clear selection if not holding shift
		if (!e.shiftKey) {
			this.selectionOperation.clearSelection();
		}

		// Mouse down on not selected entity
		if (drawableUnderCursor) {
			this.selectionOperation.addToSelection(drawableUnderCursor);
			this.selectionOperation.startMove(sceneCoordinates);
			return;
		}

		// Mouse down on empty space + selection tool
		if (this.rootStore.sceneStore.tool === SelectionPreview.type) {
			this.selectionOperation.startSelectionPreview(sceneCoordinates);
			return;
		}

		// Mouse down on empty space → start drawing
		this.drawingOperation.start(sceneCoordinates);
	};

	private handleMouseMove = (e: MouseEvent) => {
		const isMainMouseButtonPressed = e.buttons === 1;
		const sceneCoordinates = this.rootStore.sceneStore.getSceneCoordinates(e);
		const sceneCoordinatesSnapped = this.rootStore.sceneStore.getSceneCoordinates(e, true);

		// Update cursor based on position and state
		this.canvas.style.cursor = this.selectionOperation.getCursor(sceneCoordinates);

		// Update hover highlight (when not drawing or selecting)
		if (!this.drawingOperation.isDrawing() && !this.selectionOperation.isSelectionPreviewActive()) {
			this.selectionOperation.updateHover(sceneCoordinates);
		}

		if (!isMainMouseButtonPressed) return;

		// Regular drawing (with grid snapping)
		if (this.drawingOperation.isDrawing()) {
			this.drawingOperation.update(sceneCoordinatesSnapped, e.shiftKey);
			return;
		}

		// Selection preview (with grid snapping)
		if (this.selectionOperation.isSelectionPreviewActive()) {
			this.selectionOperation.updateSelectionPreview(sceneCoordinatesSnapped);
			return;
		}

		// Selection box resize (with grid snapping)
		if (this.selectionOperation.isResizing()) {
			this.selectionOperation.updateResize(sceneCoordinatesSnapped, e.shiftKey);
			return;
		}

		// Move selected drawables (with grid snapping)
		if (this.selectionOperation.isMoving()) {
			this.selectionOperation.updateMove(sceneCoordinatesSnapped);
			return;
		}
	};

	private handleMouseUp = (e: MouseEvent) => {
		const sceneCoordinates = this.rootStore.sceneStore.getSceneCoordinates(e, true);

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
		this.rootStore.sceneStore.mouseDown = null;
	};

	private handleContextMenu = (e: MouseEvent) => {
		e.preventDefault();
	};
}
