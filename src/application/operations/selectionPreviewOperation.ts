import { createSelectionPreview } from "@/infrastructure/factories/EntityFactory.ts";
import type { Position } from "@/shared/types/types.d.ts";
import type { RootStore } from "@/store/rootStore.ts";

/**
 * Manages selection preview (drag-to-select rectangle).
 * Handles starting, updating, and finishing the preview.
 */
export class SelectionPreviewOperation {
	private readonly rootStore: RootStore;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	/**
	 * Starts a selection preview at the given position.
	 */
	start(sceneCoordinates: Position) {
		const preview = createSelectionPreview();
		preview.setPosition(sceneCoordinates);
		preview.setBorderWidth(preview.borderWidth / this.rootStore.sceneStore.zoom);
		this.rootStore.selectionStore.setSelectionPreview(preview);
		this.rootStore.sceneStore.setMouseDown(sceneCoordinates);
	}

	/**
	 * Updates the selection preview as the mouse moves.
	 */
	update(sceneCoordinates: Position) {
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
	finish(shiftKey: boolean) {
		const { selectionPreview } = this.rootStore.selectionStore;
		if (!selectionPreview) return;

		const selectedDrawables = this.rootStore.drawableStore.getDrawablesInRectangle(selectionPreview);

		if (shiftKey) {
			this.rootStore.selectionStore.addMany(selectedDrawables);
		} else {
			this.rootStore.selectionStore.setDrawables(selectedDrawables);
		}

		this.rootStore.sceneStore.setMouseDown(null);
		this.rootStore.selectionStore.setSelectionPreview(null);
	}

	/**
	 * Checks if selection preview is active.
	 */
	isActive(): boolean {
		return this.rootStore.selectionStore.selectionPreview !== null;
	}
}
