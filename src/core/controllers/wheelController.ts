import type { NavigationOperation } from "@/core/operations/navigationOperation.ts";
import type { Disposable } from "@/shared/types/types";
import type { RootStore } from "@/store/rootStore.ts";

export class WheelController implements Disposable {
	private canvas: HTMLCanvasElement;
	private rootStore: RootStore;
	private navigationOperation: NavigationOperation;
	private abortController = new AbortController();

	constructor(canvas: HTMLCanvasElement, navigationOperation: NavigationOperation, rootStore: RootStore) {
		this.navigationOperation = navigationOperation;
		this.rootStore = rootStore;
		this.canvas = canvas;
	}

	init() {
		const signal = this.abortController.signal;
		this.canvas.addEventListener("wheel", this.handleWheel, { signal, passive: false });
	}

	dispose() {
		this.abortController.abort();
	}

	private handleWheel = (e: WheelEvent) => {
		e.preventDefault();

		// Zoom: Cmd (mac) or Ctrl (pc) + wheel; also covers pinch on many touchpads
		if (e.metaKey || e.ctrlKey) {
			const sceneCoordinates = this.rootStore.sceneStore.getSceneCoordinates(e);
			const factor = this.navigationOperation.getWheelZoomFactor(e);
			this.navigationOperation.zoomAt(sceneCoordinates, factor);
			return;
		}

		// Shift + mouse wheel → horizontal scroll
		if (e.shiftKey) {
			this.navigationOperation.moveOriginBy(e.deltaY / this.rootStore.sceneStore.zoom, 0);
			return;
		}

		// Trackpad two-finger moveOriginBy (both axes) or mouse wheel (vertical only)
		this.navigationOperation.moveOriginBy(
			e.deltaX / this.rootStore.sceneStore.zoom,
			-e.deltaY / this.rootStore.sceneStore.zoom,
		);
	};
}
