import type { Position } from "@/shared/types/types.d.ts";
import type { RootStore } from "@/store/rootStore.ts";

/**
 * Manages moving selected drawables.
 * Handles starting, updating, and finishing move operations.
 */
export class MoveOperation {
	private readonly rootStore: RootStore;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	/**
	 * Starts moving the current selection.
	 */
	start(startPosition: Position) {
		this.rootStore.selectionStore.startMove(startPosition);
	}

	/**
	 * Updates position of all selected drawables to a new position (with grid snapping).
	 */
	update(currentPosition: Position) {
		this.rootStore.selectionStore.updateMove(currentPosition);
	}

	/**
	 * Finishes moving operation.
	 * If it was a click (no movement), handles single selection from group.
	 */
	finish(sceneCoordinates: Position, shiftKey: boolean) {
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
					this.rootStore.selectionStore.setDrawables([drawableUnderCursor]);
				}
			}
		} else {
			this.rootStore.historyStore.push(this.rootStore.drawableStore.drawables);
		}

		this.rootStore.selectionStore.endMove();
		this.rootStore.sceneStore.setMouseDown(null);
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

	/**
	 * Checks if a move operation is in progress.
	 */
	isMoving(): boolean {
		return this.rootStore.selectionStore.isMoving;
	}
}
