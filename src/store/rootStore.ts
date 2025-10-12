import { ClientStore } from "@/store/clientStore.ts";
import { DrawableStore } from "@/store/drawableStore.ts";
import { SceneStore } from "@/store/sceneStore.ts";
import { SelectionStore } from "@/store/selectionStore.ts";

export class RootStore {
	readonly drawableStore = new DrawableStore();
	readonly sceneStore = new SceneStore();
	readonly clientStore = new ClientStore();
	readonly selectionStore = new SelectionStore();
	constructor() {}
}
