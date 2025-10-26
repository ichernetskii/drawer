import type { Position, ResizeHandle } from "@/shared/types/types.d.ts";
import type { RootStore } from "@/store/rootStore.ts";

/**
 * Manages resizing selected drawables.
 * Handles starting, updating, and finishing resize operations.
 */
export class ResizeOperation {
	private readonly rootStore: RootStore;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	/**
	 * Starts resizing the selection from the given edge/corner.
	 */
	start(edge: ResizeHandle, sceneCoordinates: Position) {
		this.rootStore.selectionStore.startResize(edge, sceneCoordinates);
		this.rootStore.sceneStore.setMouseDown(sceneCoordinates);
	}

	/**
	 * Updates the resize operation as the mouse moves.
	 * If shiftKey is pressed, maintains the original aspect ratio.
	 */
	update(sceneCoordinates: Position, shiftKey: boolean = false) {
		this.rootStore.selectionStore.updateResize(sceneCoordinates, shiftKey, this.rootStore.sceneStore.gridStep);
	}

	/**
	 * Finishes the resize operation.
	 */
	finish() {
		this.rootStore.selectionStore.endResize();
		this.rootStore.historyStore.push(this.rootStore.drawableStore.drawables);
	}

	/**
	 * Checks if a resize operation is in progress.
	 */
	isResizing(): boolean {
		return this.rootStore.selectionStore.isResizing;
	}
}
