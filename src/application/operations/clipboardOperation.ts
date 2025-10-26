import type { ClipboardAdapter } from "@/infrastructure/clipboard/ClipboardAdapter.ts";
import { snapToGrid } from "@/shared/utils/snap.ts";
import type { RootStore } from "@/store/rootStore.ts";

/**
 * Clipboard operations: copy, cut, paste, delete.
 * Uses ClipboardAdapter for clipboard management.
 */
export class ClipboardOperation {
	private readonly rootStore: RootStore;
	private readonly clipboardAdapter: ClipboardAdapter;
	private readonly pasteOffset = 25; // canvas units

	constructor(rootStore: RootStore, clipboardAdapter: ClipboardAdapter) {
		this.rootStore = rootStore;
		this.clipboardAdapter = clipboardAdapter;
	}

	/**
	 * Copies selected drawables to clipboard.
	 */
	async copy() {
		if (this.rootStore.selectionStore.drawables.length === 0) return;

		await this.clipboardAdapter.copy(this.rootStore.selectionStore.drawables);
	}

	/**
	 * Cuts selected drawables (copies and deletes them).
	 */
	async cut() {
		if (this.rootStore.selectionStore.drawables.length === 0) return;

		// Copy to clipboard first
		await this.copy();

		// Then delete selected drawables
		this.rootStore.drawableStore.deleteDrawables(this.rootStore.selectionStore.drawables);
		this.rootStore.selectionStore.setDrawables([]);
		this.rootStore.selectionStore.selectionHover.setDrawable(null);
		this.rootStore.historyStore.push(this.rootStore.drawableStore.drawables);
	}

	/**
	 * Pastes drawables from clipboard.
	 */
	async paste() {
		const drawables = await this.clipboardAdapter.paste();
		if (drawables.length === 0) return;

		// Apply paste offset
		drawables.forEach(d => {
			if (d.position) {
				d.setPosition({
					x: snapToGrid(
						d.position.x + this.pasteOffset / this.rootStore.sceneStore.zoom,
						this.rootStore.sceneStore.gridStep,
					),
					y: snapToGrid(
						d.position.y + this.pasteOffset / this.rootStore.sceneStore.zoom,
						this.rootStore.sceneStore.gridStep,
					),
				});
			}
		});

		// Add to drawable store
		drawables.forEach(drawable => {
			this.rootStore.drawableStore.addDrawable(drawable);
		});

		// Select the pasted drawables
		this.rootStore.selectionStore.setDrawables(drawables);

		// Add to history
		this.rootStore.historyStore.push(this.rootStore.drawableStore.drawables);
	}
}
