import { SceneStore } from "@/store/scene/scene.ts";

import { ShapesStore } from "./shapes/shapes.ts";

export class RootStore {
	readonly shapesStore = new ShapesStore();
	readonly sceneStore = new SceneStore();
	constructor() {}
}

export const rootStore = new RootStore();
