import type { Drawable } from "@/domain/entities/drawable/Drawable.ts";
import { cloneDrawable, createSelectionPreview } from "@/infrastructure/factories/EntityFactory";
import type { Position } from "@/shared/types/types";
import type { RootStore } from "@/store/rootStore.ts";

type ResizeHandle = "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

export class SelectionOperation {
	private readonly rootStore: RootStore;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	// ========== Selection management ==========

	/**
	 * Selects a single drawable and prepares for move.
	 */
	addToSelection(drawable: Drawable) {
		this.rootStore.selectionStore.add(drawable);
	}

	/**
	 * Removes a drawable from selection.
	 */
	removeFromSelection(drawable: Drawable) {
		this.rootStore.selectionStore.delete(drawable);
	}

	/**
	 * Clears all selection.
	 */
	clearSelection() {
		this.rootStore.selectionStore.drawables = [];
	}

	/**
	 * Selects all drawables on the canvas.
	 */
	selectAll() {
		this.rootStore.selectionStore.drawables = [...this.rootStore.drawableStore.drawables];
	}

	/**
	 * Copies selected drawables to clipboard.
	 */
	copy() {
		if (this.rootStore.selectionStore.drawables.length === 0) return;

		// Store references to selected drawables
		this.rootStore.selectionStore.clipboard = [...this.rootStore.selectionStore.drawables];
	}

	/**
	 * Cuts selected drawables (copies and deletes them).
	 */
	cut() {
		if (this.rootStore.selectionStore.drawables.length === 0) return;

		// Copy to clipboard first
		this.copy();

		// Then delete selected drawables
		this.deleteSelected();
	}

	/**
	 * Pastes drawables from clipboard.
	 */
	paste() {
		if (this.rootStore.selectionStore.clipboard.length === 0) return;

		// Create new instances from clipboard drawables
		const pasteOffset = 20; // Offset for pasted drawables in scene units
		const pastedDrawables = this.rootStore.selectionStore.clipboard.map(drawable => {
			const copy = cloneDrawable(drawable);
			// Apply offset to position
			if (copy.position) {
				copy.setPosition({
					x: copy.position.x + pasteOffset,
					y: copy.position.y + pasteOffset,
				});
			}
			return copy;
		});

		// Add to drawable store
		pastedDrawables.forEach(drawable => {
			this.rootStore.drawableStore.addDrawable(drawable);
		});

		// Select the pasted drawables
		this.rootStore.selectionStore.drawables = pastedDrawables;

		// Add to history
		this.rootStore.historyStore.push(this.rootStore.drawableStore.drawables);
	}

	/**
	 * Deletes selected drawables from the canvas.
	 */
	deleteSelected() {
		this.rootStore.drawableStore.deleteDrawables(this.rootStore.selectionStore.drawables);
		this.rootStore.selectionStore.drawables = [];
		this.rootStore.selectionStore.selectionHover.setDrawable(null);
		this.rootStore.historyStore.push(this.rootStore.drawableStore.drawables);
	}

	// ========== Selection preview (drag to select) ==========

	/**
	 * Starts a selection preview at the given position.
	 */
	startSelectionPreview(sceneCoordinates: Position) {
		const preview = createSelectionPreview();
		preview.setPosition(sceneCoordinates);
		preview.setBorderWidth(preview.borderWidth / this.rootStore.sceneStore.zoom);
		this.rootStore.selectionStore.selectionPreview = preview;
		this.rootStore.sceneStore.mouseDown = sceneCoordinates;
	}

	/**
	 * Updates the selection preview as the mouse moves.
	 */
	updateSelectionPreview(sceneCoordinates: Position) {
		const { selectionPreview } = this.rootStore.selectionStore;
		const { mouseDown } = this.rootStore.sceneStore;

		if (!selectionPreview || !mouseDown) return;

		selectionPreview.setPosition({ ...mouseDown });
		selectionPreview.setSize({
			width: sceneCoordinates.x - mouseDown.x,
			height: sceneCoordinates.y - mouseDown.y,
		});
		selectionPreview.normalize();
	}

	/**
	 * Finishes the selection preview and selects all drawables within it.
	 */
	finishSelectionPreview(shiftKey: boolean) {
		const { selectionPreview } = this.rootStore.selectionStore;
		if (!selectionPreview) return;

		const selectedDrawables = this.rootStore.drawableStore.getDrawablesInRectangle(selectionPreview);

		if (shiftKey) {
			this.rootStore.selectionStore.addMany(selectedDrawables);
		} else {
			this.rootStore.selectionStore.drawables = selectedDrawables;
		}

		this.rootStore.sceneStore.mouseDown = null;
		this.rootStore.selectionStore.selectionPreview = null;
	}

	/**
	 * Checks if selection preview is active.
	 */
	isSelectionPreviewActive(): boolean {
		return this.rootStore.selectionStore.selectionPreview !== null;
	}

	// ========== Move operations ==========

	/**
	 * Checks if a move operation is in progress.
	 */
	isMoving(): boolean {
		return this.rootStore.selectionStore.isMoving;
	}

	/**
	 * Starts moving the current selection.
	 */
	startMove(startPosition: Position) {
		this.rootStore.selectionStore.startMove(startPosition);
	}

	/**
	 * Updates position of all selected drawables to a new position (with grid snapping).
	 */
	updateMove(currentPosition: Position) {
		this.rootStore.selectionStore.updateMove(currentPosition);
	}

	/**
	 * Finishes moving operation.
	 * If it was a click (no movement), handles single selection from group.
	 */
	finishMove(sceneCoordinates: Position, shiftKey: boolean) {
		const { mouseDown } = this.rootStore.sceneStore;
		const { drawables } = this.rootStore.selectionStore;

		// Check if it was a click (no mouse movement)
		const wasClicked =
			mouseDown && sceneCoordinates.x === mouseDown.x && sceneCoordinates.y === mouseDown.y && !shiftKey;

		if (wasClicked) {
			if (drawables.length > 1) {
				// Click on one drawable from group → select only that one
				const drawableUnderCursor = this.rootStore.drawableStore.getDrawableAtPosition(sceneCoordinates);
				if (drawableUnderCursor && drawables.includes(drawableUnderCursor)) {
					this.rootStore.selectionStore.drawables = [drawableUnderCursor];
				}
			}
		} else {
			this.rootStore.historyStore.push(this.rootStore.drawableStore.drawables);
		}

		this.rootStore.selectionStore.endMove();
		this.rootStore.sceneStore.mouseDown = null;
	}

	/**
	 * Moves selected drawables by a delta (for keyboard navigation).
	 */
	moveBy(deltaX: number, deltaY: number) {
		const { drawables } = this.rootStore.selectionStore;

		// Move drawables using their moveBy method
		drawables.forEach(drawable => {
			drawable.moveBy(deltaX, deltaY);
		});

		this.rootStore.historyStore.push(this.rootStore.drawableStore.drawables);
	}

	// ========== Resize operations ==========

	/**
	 * Starts resizing the selection from the given edge/corner.
	 */
	startResize(edge: ResizeHandle, sceneCoordinates: Position) {
		this.rootStore.selectionStore.startResize(edge, sceneCoordinates);
		this.rootStore.sceneStore.mouseDown = sceneCoordinates;
	}

	/**
	 * Updates the resize operation as the mouse moves.
	 * If shiftKey is pressed, maintains the original aspect ratio.
	 */
	updateResize(sceneCoordinates: Position, shiftKey: boolean = false) {
		this.rootStore.selectionStore.updateResize(sceneCoordinates, shiftKey, this.rootStore.sceneStore.gridStep);
	}

	/**
	 * Finishes the resize operation.
	 */
	finishResize() {
		this.rootStore.selectionStore.endResize();
		this.rootStore.historyStore.push(this.rootStore.drawableStore.drawables);
	}

	/**
	 * Checks if a resize operation is in progress.
	 */
	isResizing(): boolean {
		return this.rootStore.selectionStore.isResizing;
	}

	// ========== Helper methods ==========

	/**
	 * Checks if the position is on an edge of the selection box.
	 */
	getEdgeAtPosition(sceneCoordinates: Position): ResizeHandle | null {
		return this.rootStore.selectionStore.getPositionOnEdgeOfSelection(sceneCoordinates);
	}

	/**
	 * Checks if the position is inside the selection box.
	 */
	isPositionInsideSelection(sceneCoordinates: Position): boolean {
		return this.rootStore.selectionStore.isPositionInsideSelection(sceneCoordinates);
	}

	/**
	 * Updates hover highlight based on mouse position.
	 */
	updateHover(sceneCoordinates: Position) {
		const drawable = this.rootStore.drawableStore.getDrawableAtPosition(sceneCoordinates);
		this.rootStore.selectionStore.selectionHover.setDrawable(drawable);
	}

	/**
	 * Gets the appropriate cursor for the current position and state.
	 */
	getCursor(sceneCoordinates: Position): string {
		return this.rootStore.selectionStore.getCursor(sceneCoordinates);
	}
}
