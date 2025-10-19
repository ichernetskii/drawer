import type { Position } from "@/shared/types/types";
import type { RootStore } from "@/store/rootStore.ts";

export class NavigationOperation {
	private readonly rootStore: RootStore;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	/**
	 * Zooms at a specific scene coordinate (e.g., mouse position).
	 * Keeps the point under the cursor stationary during zoom.
	 */
	zoomAt(sceneCoordinates: Position, factor: number) {
		this.rootStore.sceneStore.zoomAtSceneCoordinates(sceneCoordinates, factor);
		this.rootStore.selectionStore.zoom = this.rootStore.sceneStore.zoom;
	}

	/**
	 * Zooms in by the default zoom factor.
	 */
	zoomIn() {
		this.rootStore.sceneStore.zoom = this.rootStore.sceneStore.zoom * this.rootStore.sceneStore.zoomFactor;
	}

	/**
	 * Zooms out by the default zoom factor.
	 */
	zoomOut() {
		this.rootStore.sceneStore.zoom = this.rootStore.sceneStore.zoom / this.rootStore.sceneStore.zoomFactor;
	}

	/**
	 * Resets zoom to 1:1 (100%).
	 */
	resetZoom() {
		this.rootStore.sceneStore.zoom = 1;
	}

	/**
	 * Calculates zoom factor from wheel event.
	 */
	getWheelZoomFactor(event: WheelEvent): number {
		return this.rootStore.sceneStore.getWheelZoomFactor(event);
	}

	/**
	 * Move the canvas by the given delta.
	 */
	moveOriginBy(deltaX: number, deltaY: number) {
		this.rootStore.sceneStore.moveOriginBy({ x: deltaX, y: deltaY });
	}

	toggleGrid() {
		this.rootStore.sceneStore.toggleGrid();
	}
}
