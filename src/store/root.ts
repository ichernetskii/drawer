import { ClientStore } from "@/store/client/client.ts";
import { SceneStore } from "@/store/scene/scene.ts";
import { ShapesStore } from "@/store/shapes/shapes.ts";

export class RootStore {
	readonly shapesStore = new ShapesStore();
	readonly sceneStore = new SceneStore();
	readonly clientStore = new ClientStore();
	constructor() {}
}

export const rootStore = new RootStore();
