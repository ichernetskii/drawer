import { reaction } from "mobx";

import type { SceneStore } from "@/store/sceneStore/sceneStore.ts";
import type { SelectionStore } from "@/store/selectionStore/selectionStore.ts";

export function handleChangeScene(sceneStore: SceneStore) {
	return reaction(
		() => [sceneStore.zoom, sceneStore.origin, sceneStore.tool],
		() => sceneStore.save(),
	);
}

export function handleZoomChangeScene(sceneStore: SceneStore, selectionStore: SelectionStore) {
	return reaction(
		() => sceneStore.zoom,
		zoom => {
			selectionStore.zoom = zoom;
			selectionStore.selectionHover.setZoom(zoom);
		},
	);
}
