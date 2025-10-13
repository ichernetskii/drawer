import type { Position } from "@/shared/types/types";
import type { SceneStore } from "@/store/sceneStore.ts";
import type { SelectionStore } from "@/store/selectionStore.ts";

export class NavigationOperation {
	private sceneStore: SceneStore;
	private selectionStore: SelectionStore;

	constructor(sceneStore: SceneStore, selectionStore: SelectionStore) {
		this.selectionStore = selectionStore;
		this.sceneStore = sceneStore;
	}

	/**
	 * Zooms at a specific scene coordinate (e.g., mouse position).
	 * Keeps the point under the cursor stationary during zoom.
	 */
	zoomAt(sceneCoordinates: Position, factor: number) {
		this.sceneStore.zoomAtSceneCoordinates(sceneCoordinates, factor);
		this.selectionStore.zoom = this.sceneStore.zoom;
	}

	/**
	 * Zooms in by the default zoom factor.
	 */
	zoomIn() {
		this.sceneStore.zoom = this.sceneStore.zoom * this.sceneStore.zoomFactor;
	}

	/**
	 * Zooms out by the default zoom factor.
	 */
	zoomOut() {
		this.sceneStore.zoom = this.sceneStore.zoom / this.sceneStore.zoomFactor;
	}

	/**
	 * Resets zoom to 1:1 (100%).
	 */
	resetZoom() {
		this.sceneStore.zoom = 1;
	}

	/**
	 * Calculates zoom factor from wheel event.
	 */
	getWheelZoomFactor(event: WheelEvent): number {
		return this.sceneStore.getWheelZoomFactor(event);
	}

	/**
	 * Translate the canvas by the given delta.
	 */
	translateOriginBy(deltaX: number, deltaY: number) {
		this.sceneStore.translateOriginBy({ x: deltaX, y: deltaY });
	}
}
