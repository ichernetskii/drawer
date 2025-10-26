import type { Drawable } from "@/domain/entity/drawable/Drawable.ts";
import type { RootStore } from "@/store/rootStore.ts";

/**
 * Manages selection of drawables.
 * Handles adding, removing, clearing, and selecting all drawables.
 */
export class SelectionBoxOperation {
	private readonly rootStore: RootStore;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	/**
	 * Adds a drawable to selection.
	 */
	add(drawable: Drawable) {
		this.rootStore.selectionStore.add(drawable);
	}

	/**
	 * Removes a drawable from selection.
	 */
	clear(drawable: Drawable) {
		this.rootStore.selectionStore.delete(drawable);
	}

	/**
	 * Clears all selection.
	 */
	clearAll() {
		this.rootStore.selectionStore.setDrawables([]);
	}

	/**
	 * Deletes selected drawables from the canvas.
	 */
	delete() {
		this.rootStore.drawableStore.deleteDrawables(this.rootStore.selectionStore.drawables);
		this.rootStore.selectionStore.setDrawables([]);
		this.rootStore.selectionStore.selectionHover.setDrawable(null);
		this.rootStore.historyStore.push(this.rootStore.drawableStore.drawables);
	}

	/**
	 * Selects all drawables on the canvas.
	 */
	selectAll() {
		this.rootStore.selectionStore.setDrawables([...this.rootStore.drawableStore.drawables]);
	}
}
