import { DrawableRepository } from "@/infrastructure/persistence/DrawableRepository";
import { SceneRepository } from "@/infrastructure/persistence/SceneRepository";
import type { Disposable } from "@/shared/types/types";
import { ClientStore } from "@/store/clientStore/clientStore.ts";
import { DrawableStore } from "@/store/drawableStore/drawableStore.ts";
import { handleChangeDrawables } from "@/store/drawableStore/reactions.ts";
import { HistoryStore } from "@/store/historyStore/historyStore.ts";
import { handleChangeScene, handleZoomChangeScene } from "@/store/sceneStore/reactions.ts";
import { SceneStore } from "@/store/sceneStore/sceneStore.ts";
import { SelectionStore } from "@/store/selectionStore/selectionStore.ts";

export class RootStore implements Disposable {
	readonly drawableStore = new DrawableStore(new DrawableRepository());
	readonly sceneStore = new SceneStore(new SceneRepository());
	readonly clientStore = new ClientStore();
	readonly selectionStore = new SelectionStore();
	readonly historyStore = new HistoryStore();

	readonly disposables = [
		handleChangeDrawables(this.drawableStore),
		handleChangeScene(this.sceneStore),
		handleZoomChangeScene(this.sceneStore, this.selectionStore),
	];

	dispose() {
		this.disposables.forEach(disposable => disposable());
	}
}
