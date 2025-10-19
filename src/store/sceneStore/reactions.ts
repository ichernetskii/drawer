import { reaction } from "mobx";

import type { SceneStore } from "@/store/sceneStore/sceneStore.ts";

export function handleChangeScene(sceneStore: SceneStore) {
	return reaction(
		() => [sceneStore.zoom, sceneStore.origin, sceneStore.tool],
		() => sceneStore.save(),
	);
}
