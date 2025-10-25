import type { Disposable } from "@/shared/types/types.d.ts";
import { ClientStore } from "@/store/clientStore/clientStore.ts";
import { DrawableStore } from "@/store/drawableStore/drawableStore.ts";
import { HistoryStore } from "@/store/historyStore/historyStore.ts";
import { handleZoomChangeScene } from "@/store/sceneStore/reactions.ts";
import { SceneStore } from "@/store/sceneStore/sceneStore.ts";
import { SelectionStore } from "@/store/selectionStore/selectionStore.ts";

export class RootStore implements Disposable {
	readonly drawableStore = new DrawableStore();
	readonly sceneStore = new SceneStore();
	readonly clientStore = new ClientStore();
	readonly selectionStore = new SelectionStore();
	readonly historyStore = new HistoryStore();

	private readonly disposables = [handleZoomChangeScene(this.sceneStore, this.selectionStore)];

	dispose() {
		this.disposables.forEach(disposable => disposable());
		this.disposables.length = 0;
	}
}
