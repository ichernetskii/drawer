import type { NavigationOperation } from "@/core/operations/navigationOperation.ts";
import type { SelectionOperation } from "@/core/operations/selectionOperation.ts";
import type { Disposable } from "@/shared/types/types";
import { Ellipse } from "@/store/entity/drawable/ellipse/ellipse.ts";
import { Rectangle } from "@/store/entity/drawable/rectangle/rectangle.ts";
import { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";
import type { HistoryStore } from "@/store/historyStore/historyStore.ts";
import type { SceneStore } from "@/store/sceneStore/sceneStore.ts";
import type { SelectionStore } from "@/store/selectionStore/selectionStore.ts";
import type { DrawableStore } from "@/store/drawableStore/drawableStore.ts";

export class KeyboardController implements Disposable {
	private navigationOperation: NavigationOperation;
	private selectionOperation: SelectionOperation;
	private sceneStore: SceneStore;
	private selectionStore: SelectionStore;
	private drawableStore: DrawableStore;
	private historyStore: HistoryStore;
	private abortController = new AbortController();

	constructor(
		navigationOperation: NavigationOperation,
		selectionOperation: SelectionOperation,
		sceneStore: SceneStore,
		selectionStore: SelectionStore,
		drawableStore: DrawableStore,
		historyStore: HistoryStore,
	) {
		this.selectionStore = selectionStore;
		this.sceneStore = sceneStore;
		this.selectionOperation = selectionOperation;
		this.navigationOperation = navigationOperation;
		this.drawableStore = drawableStore;
		this.historyStore = historyStore;
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
					const snapshot = this.historyStore.pop();
					if (snapshot) {
						this.drawableStore.drawables = snapshot;
						this.selectionStore.drawables = [];
						this.selectionStore.selectionHover.drawable = null;
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
				this.sceneStore.tool = SelectionPreview.type;
				break;

			case "KeyR":
				this.sceneStore.tool = Rectangle.type;
				break;

			case "KeyE":
				this.sceneStore.tool = Ellipse.type;
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
		const translateStep = this.sceneStore.gridStep * (e.shiftKey ? this.sceneStore.gridStepShiftMultiplier : 1);
		const deltaX = dx * translateStep;
		const deltaY = dy * translateStep;

		if (this.selectionStore.drawables.length !== 0) {
			// Move selected items
			this.selectionOperation.moveBy(deltaX, deltaY);
		} else {
			// Pan canvas
			this.navigationOperation.moveOriginBy(deltaX, deltaY);
		}
	}
}
