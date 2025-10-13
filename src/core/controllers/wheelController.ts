import type { NavigationOperation } from "@/core/operations/navigationOperation.ts";
import type { SceneStore } from "@/store/sceneStore.ts";

export class WheelController {
	private canvas: HTMLCanvasElement;
	private sceneStore: SceneStore;
	private navigationOperation: NavigationOperation;
	private abortController = new AbortController();

	constructor(canvas: HTMLCanvasElement, navigationOperation: NavigationOperation, sceneStore: SceneStore) {
		this.navigationOperation = navigationOperation;
		this.sceneStore = sceneStore;
		this.canvas = canvas;
	}

	init() {
		const signal = this.abortController.signal;
		this.canvas.addEventListener("wheel", this.handleWheel, { signal, passive: false });
	}

	destroy() {
		this.abortController.abort();
	}

	private handleWheel = (e: WheelEvent) => {
		e.preventDefault();

		// Zoom: Cmd (mac) or Ctrl (pc) + wheel; also covers pinch on many touchpads
		if (e.metaKey || e.ctrlKey) {
			const sceneCoordinates = this.sceneStore.getSceneCoordinates(e);
			const factor = this.navigationOperation.getWheelZoomFactor(e);
			this.navigationOperation.zoomAt(sceneCoordinates, factor);
			return;
		}

		// Shift + mouse wheel → horizontal scroll
		if (e.shiftKey) {
			this.navigationOperation.translateOriginBy(e.deltaY / this.sceneStore.zoom, 0);
			return;
		}

		// Trackpad two-finger translateOriginBy (both axes) or mouse wheel (vertical only)
		this.navigationOperation.translateOriginBy(e.deltaX / this.sceneStore.zoom, -e.deltaY / this.sceneStore.zoom);
	};
}
