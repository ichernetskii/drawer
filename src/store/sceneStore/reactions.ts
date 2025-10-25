import { reaction } from "mobx";

import type { SceneStore } from "@/store/sceneStore/sceneStore.ts";
import type { SelectionStore } from "@/store/selectionStore/selectionStore.ts";

export function handleZoomChangeScene(sceneStore: SceneStore, selectionStore: SelectionStore) {
	return reaction(
		() => sceneStore.zoom,
		zoom => {
			selectionStore.setZoom(zoom);
			selectionStore.selectionHover.setZoom(zoom);
		},
	);
}
