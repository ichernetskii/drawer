import type { NavigationOperation } from "@/core/operations/navigationOperation.ts";
import type { Disposable } from "@/shared/types/types";
import type { SceneStore } from "@/store/sceneStore/sceneStore.ts";

export class WheelController implements Disposable {
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

	dispose() {
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
			this.navigationOperation.moveOriginBy(e.deltaY / this.sceneStore.zoom, 0);
			return;
		}

		// Trackpad two-finger moveOriginBy (both axes) or mouse wheel (vertical only)
		this.navigationOperation.moveOriginBy(e.deltaX / this.sceneStore.zoom, -e.deltaY / this.sceneStore.zoom);
	};
}
