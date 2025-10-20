import type { NavigationOperation } from "@/core/operations/navigationOperation.ts";
import type { SelectionOperation } from "@/core/operations/selectionOperation.ts";
import type { Disposable } from "@/shared/types/types";
import { Ellipse } from "@/store/entity/drawable/ellipse/ellipse.ts";
import { Rectangle } from "@/store/entity/drawable/rectangle/rectangle.ts";
import { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";
import type { RootStore } from "@/store/rootStore.ts";

export class KeyboardController implements Disposable {
	private navigationOperation: NavigationOperation;
	private selectionOperation: SelectionOperation;
	private rootStore: RootStore;
	private abortController = new AbortController();

	constructor(
		navigationOperation: NavigationOperation,
		selectionOperation: SelectionOperation,
		rootStore: RootStore,
	) {
		this.rootStore = rootStore;
		this.selectionOperation = selectionOperation;
		this.navigationOperation = navigationOperation;
	}

	init() {
		const signal = this.abortController.signal;
		document.addEventListener("keydown", this.handleKeyDown, { signal });
	}

	dispose() {
		this.abortController.abort();
	}

	private handleKeyDown = (e: KeyboardEvent) => {
		switch (e.code) {
			case "KeyZ": {
				if (e.metaKey || e.ctrlKey) {
					// Cmd/Ctrl+Shift+Z = Redo
					// Cmd/Ctrl+Z = Undo
					const snapshot = e.shiftKey
						? this.rootStore.historyStore.redo()
						: this.rootStore.historyStore.undo();

					if (snapshot) {
						this.rootStore.drawableStore.drawables = snapshot;
						this.rootStore.selectionStore.drawables = [];
						this.rootStore.selectionStore.selectionHover.drawable = null;
					}
				}
				break;
			}
			case "Escape":
				this.selectionOperation.clearSelection();
				break;

			case "Backspace":
			case "Delete":
				this.selectionOperation.deleteSelected();
				break;

			case "ArrowRight":
			case "ArrowLeft":
			case "ArrowUp":
			case "ArrowDown":
				this.handleArrowKeys(e);
				break;

			case "KeyV":
				this.rootStore.sceneStore.tool = SelectionPreview.type;
				break;

			case "KeyR":
				this.rootStore.sceneStore.tool = Rectangle.type;
				break;

			case "KeyE":
				this.rootStore.sceneStore.tool = Ellipse.type;
				break;

			case "KeyG":
				this.navigationOperation.toggleGrid();
				break;

			case "Equal":
			case "NumpadAdd":
				this.navigationOperation.zoomIn();
				break;

			case "Minus":
			case "NumpadSubtract":
				this.navigationOperation.zoomOut();
				break;

			case "Digit0":
				if (e.metaKey || e.ctrlKey) {
					this.navigationOperation.resetZoom();
				}
				break;
		}
	};

	/**
	 * Handles arrow key navigation:
	 * - If items are selected, moves them by gridStep
	 * - Otherwise, pans the canvas
	 */
	private handleArrowKeys(e: KeyboardEvent) {
		let dx = 0;
		let dy = 0;

		switch (e.code) {
			case "ArrowRight":
				dx = 1;
				break;
			case "ArrowLeft":
				dx = -1;
				break;
			case "ArrowUp":
				dy = 1;
				break;
			case "ArrowDown":
				dy = -1;
				break;
		}

		// Move selected items by grid step
		const translateStep =
			this.rootStore.sceneStore.gridStep * (e.shiftKey ? this.rootStore.sceneStore.gridStepShiftMultiplier : 1);
		const deltaX = dx * translateStep;
		const deltaY = dy * translateStep;

		if (this.rootStore.selectionStore.drawables.length !== 0) {
			// Move selected items
			this.selectionOperation.moveBy(deltaX, deltaY);
		} else {
			// Pan canvas
			this.navigationOperation.moveOriginBy(deltaX, deltaY);
		}
	}
}
