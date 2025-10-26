import type { DrawingOperation } from "@/application/operations/drawingOperation.ts";
import type { HoverOperation } from "@/application/operations/hoverOperation.ts";
import type { MoveOperation } from "@/application/operations/moveOperation.ts";
import type { ResizeOperation } from "@/application/operations/resizeOperation.ts";
import type { SelectionBoxOperation } from "@/application/operations/selectionBoxOperation.ts";
import type { SelectionPreviewOperation } from "@/application/operations/selectionPreviewOperation.ts";
import { SelectionPreview } from "@/domain/entity/selection/selectionPreview/SelectionPreview.ts";
import type { Disposable } from "@/shared/types/types.d.ts";
import type { RootStore } from "@/store/rootStore.ts";

export class MouseController implements Disposable {
	private canvas: HTMLCanvasElement;
	private drawingOperation: DrawingOperation;
	private selectionBoxOperation: SelectionBoxOperation;
	private selectionPreviewOperation: SelectionPreviewOperation;
	private moveOperation: MoveOperation;
	private resizeOperation: ResizeOperation;
	private hoverOperation: HoverOperation;
	private rootStore: RootStore;
	private abortController = new AbortController();

	constructor(
		canvas: HTMLCanvasElement,
		drawingOperation: DrawingOperation,
		selectionBoxOperation: SelectionBoxOperation,
		selectionPreviewOperation: SelectionPreviewOperation,
		moveOperation: MoveOperation,
		resizeOperation: ResizeOperation,
		hoverOperation: HoverOperation,
		rootStore: RootStore,
	) {
		this.canvas = canvas;
		this.drawingOperation = drawingOperation;
		this.selectionBoxOperation = selectionBoxOperation;
		this.selectionPreviewOperation = selectionPreviewOperation;
		this.moveOperation = moveOperation;
		this.resizeOperation = resizeOperation;
		this.hoverOperation = hoverOperation;
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
		this.rootStore.sceneStore.setMouseDown(sceneCoordinates);

		// Mouse down on the edge of selection → start resize
		const edge = this.rootStore.selectionStore.getEdgeAtPosition(sceneCoordinatesUnsnapped);
		if (edge) {
			this.resizeOperation.start(edge, sceneCoordinates);
			return;
		}

		// Mouse down inside selection box (not on edge) → prepare for move
		const isInsideSelection = this.rootStore.selectionStore.isPositionInsideSelection(sceneCoordinates);
		if (isInsideSelection) {
			// Shift + mousedown inside selection on specific drawable → remove from selection
			if (
				e.shiftKey &&
				drawableUnderCursor &&
				this.rootStore.selectionStore.drawables.includes(drawableUnderCursor)
			) {
				this.selectionBoxOperation.clear(drawableUnderCursor);
				return;
			}
			// Start move operation (keep hover active)
			this.moveOperation.start(sceneCoordinates);
			return;
		}

		// Clear selection if not holding shift
		if (!e.shiftKey) {
			this.selectionBoxOperation.clearAll();
		}

		// Mouse down on not selected entity
		if (drawableUnderCursor) {
			this.selectionBoxOperation.add(drawableUnderCursor);
			this.moveOperation.start(sceneCoordinates);
			return;
		}

		// Mouse down on empty space + selection tool
		if (this.rootStore.sceneStore.tool === SelectionPreview.type) {
			this.selectionPreviewOperation.start(sceneCoordinates);
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
		this.canvas.style.cursor = this.rootStore.selectionStore.getCursor(sceneCoordinates);

		// Update hover highlight (when not drawing or selecting)
		if (!this.drawingOperation.isDrawing() && !this.selectionPreviewOperation.isActive()) {
			this.hoverOperation.update(sceneCoordinates);
		}

		if (!isMainMouseButtonPressed) return;

		// Regular drawing (with grid snapping)
		if (this.drawingOperation.isDrawing()) {
			this.drawingOperation.update(sceneCoordinatesSnapped, e.shiftKey);
			return;
		}

		// Selection preview (with grid snapping)
		if (this.selectionPreviewOperation.isActive()) {
			this.selectionPreviewOperation.update(sceneCoordinatesSnapped);
			return;
		}

		// Selection box resize (with grid snapping)
		if (this.resizeOperation.isResizing()) {
			this.resizeOperation.update(sceneCoordinatesSnapped, e.shiftKey);
			return;
		}

		// Move selected drawables (with grid snapping)
		if (this.moveOperation.isMoving()) {
			this.moveOperation.update(sceneCoordinatesSnapped);
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
		if (this.selectionPreviewOperation.isActive()) {
			this.selectionPreviewOperation.finish(e.shiftKey);
			return;
		}

		// Selection box resize finished
		if (this.resizeOperation.isResizing()) {
			this.resizeOperation.finish();
			return;
		}

		// Move finished
		if (this.moveOperation.isMoving()) {
			this.moveOperation.finish(sceneCoordinates, e.shiftKey);
			return;
		}

		// No active operation
		this.rootStore.sceneStore.setMouseDown(null);
	};

	private handleContextMenu = (e: MouseEvent) => {
		e.preventDefault();
	};
}
