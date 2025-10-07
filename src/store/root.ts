import { ClientStore } from "@/store/client.ts";
import { SceneStore } from "@/store/scene.ts";
import { SelectionStore } from "@/store/selection.ts";
import { ShapesStore } from "@/store/shapes.ts";

export class RootStore {
	readonly shapesStore = new ShapesStore();
	readonly sceneStore = new SceneStore();
	readonly clientStore = new ClientStore();
	readonly selectionStore = new SelectionStore();
	constructor() {}
}

export const rootStore = new RootStore();
