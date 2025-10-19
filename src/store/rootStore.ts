import type { Disposable } from "@/shared/types/types";
import { ClientStore } from "@/store/clientStore/clientStore.ts";
import { DrawableStore } from "@/store/drawableStore/drawableStore.ts";
import { handleChangeDrawables } from "@/store/drawableStore/reactions.ts";
import { handleChangeScene } from "@/store/sceneStore/reactions.ts";
import { SceneStore } from "@/store/sceneStore/sceneStore.ts";
import { SelectionStore } from "@/store/selectionStore/selectionStore.ts";

export class RootStore implements Disposable {
	readonly drawableStore = new DrawableStore();
	readonly sceneStore = new SceneStore();
	readonly clientStore = new ClientStore();
	readonly selectionStore = new SelectionStore();

	readonly disposables = [handleChangeDrawables(this.drawableStore), handleChangeScene(this.sceneStore)];

	dispose() {
		this.disposables.forEach(disposable => disposable());
	}
}
