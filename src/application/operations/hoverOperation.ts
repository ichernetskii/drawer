import type { Position } from "@/shared/types/types.d.ts";
import type { RootStore } from "@/store/rootStore.ts";

/**
 * Manages hover highlight on drawables.
 * Updates the selection hover based on mouse position.
 */
export class HoverOperation {
	private readonly rootStore: RootStore;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	/**
	 * Updates hover highlight based on mouse position.
	 */
	update(sceneCoordinates: Position) {
		const drawable = this.rootStore.drawableStore.getDrawableAtPosition(sceneCoordinates);
		this.rootStore.selectionStore.selectionHover.setDrawable(drawable);
	}
}
