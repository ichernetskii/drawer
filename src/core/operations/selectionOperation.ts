import type { Position } from "@/shared/types/types";
import type { DrawableStore } from "@/store/drawableStore/drawableStore.ts";
import type { Drawable } from "@/store/entity/drawable/drawable.ts";
import { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";
import type { HistoryStore } from "@/store/historyStore/historyStore.ts";
import type { SceneStore } from "@/store/sceneStore/sceneStore.ts";
import type { SelectionStore } from "@/store/selectionStore/selectionStore.ts";

type ResizeHandle = "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export class SelectionOperation {
	private readonly selectionStore: SelectionStore;
	private readonly drawableStore: DrawableStore;
	private readonly sceneStore: SceneStore;
	private readonly historyStore: HistoryStore;

	constructor(
		selectionStore: SelectionStore,
		drawableStore: DrawableStore,
		sceneStore: SceneStore,
		historyStore: HistoryStore,
	) {
		this.sceneStore = sceneStore;
		this.drawableStore = drawableStore;
		this.selectionStore = selectionStore;
		this.historyStore = historyStore;
	}

	// ========== Selection management ==========

	/**
	 * Selects a single drawable and prepares for move.
	 */
	addToSelection(drawable: Drawable) {
		this.selectionStore.add(drawable);
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
		this.historyStore.push(this.drawableStore.drawables);
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
	 * Checks if a move operation is in progress.
	 */
	isMoving(): boolean {
		return this.selectionStore.isMoving;
	}

	/**
	 * Starts moving the current selection.
	 */
	startMove(startPosition: Position) {
		this.historyStore.push(this.drawableStore.drawables);
		this.selectionStore.startMove(startPosition);
	}

	/**
	 * Updates position of all selected drawables to a new position (with grid snapping).
	 */
	updateMove(currentPosition: Position) {
		this.selectionStore.updateMove(currentPosition);
	}

	/**
	 * Finishes moving operation.
	 * If it was a click (no movement), handles single selection from group.
	 */
	finishMove(sceneCoordinates: Position, shiftKey: boolean) {
		const { mouseDown } = this.sceneStore;
		const { drawables } = this.selectionStore;

		// Check if it was a click (no mouse movement)
		const wasClicked =
			mouseDown && sceneCoordinates.x === mouseDown.x && sceneCoordinates.y === mouseDown.y && !shiftKey;

		if (wasClicked) {
			if (drawables.length > 1) {
				// Click on one drawable from group → select only that one
				const drawableUnderCursor = this.drawableStore.getDrawableAtPosition(sceneCoordinates);
				if (drawableUnderCursor && drawables.includes(drawableUnderCursor)) {
					this.selectionStore.drawables = [drawableUnderCursor];
				}
			}

			// remove snapshot pushed at startMove
			this.historyStore.pop();
		}

		this.selectionStore.endMove();
		this.sceneStore.mouseDown = null;
	}

	/**
	 * Moves selected drawables by a delta (for keyboard navigation).
	 */
	moveBy(deltaX: number, deltaY: number) {
		const { drawables } = this.selectionStore;
		this.historyStore.push(this.drawableStore.drawables);

		drawables.forEach(entity => {
			if (entity.position) {
				entity.position = {
					x: entity.position.x + deltaX,
					y: entity.position.y + deltaY,
				};
			}
		});
	}

	// ========== Resize operations ==========

	/**
	 * Starts resizing the selection from the given edge/corner.
	 */
	startResize(edge: ResizeHandle, sceneCoordinates: Position) {
		this.historyStore.push(this.drawableStore.drawables);
		this.selectionStore.startResize(edge, sceneCoordinates);
		this.sceneStore.mouseDown = sceneCoordinates;
	}

	/**
	 * Updates the resize operation as the mouse moves.
	 * If shiftKey is pressed, maintains the original aspect ratio.
	 */
	updateResize(sceneCoordinates: Position, shiftKey: boolean = false) {
		this.selectionStore.updateResize(sceneCoordinates, shiftKey, this.sceneStore.gridStep);
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
	 * Gets the appropriate cursor for the current position and state.
	 */
	getCursor(sceneCoordinates: Position): string {
		return this.selectionStore.getCursor(sceneCoordinates);
	}
}
