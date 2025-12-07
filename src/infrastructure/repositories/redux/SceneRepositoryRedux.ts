import {
	dataModelToPosition,
	dataModelToScene,
	dataModelToSize,
	positionToDataModel,
	sizeToDataModel,
} from "@adapters";
import type { ClientSize, ISceneRepository, ScenePosition } from "@domain";
import type { IReactiveRepository } from "@infrastructure/repositories/IReactiveRepository.d.ts";

import { sceneActions } from "./store/sceneSlice.ts";
import { type ISceneStoreRedux } from "./store/store.ts";

export class SceneRepositoryRedux implements ISceneRepository, IReactiveRepository {
	private store: ISceneStoreRedux;

	constructor(size: ClientSize, store: ISceneStoreRedux) {
		this.store = store;
		this.setSize(size);
	}

	// Queries
	get scene() {
		return dataModelToScene(this.store.getState().scene);
	}

	get zoom(): number {
		return this.scene.zoom;
	}

	get origin(): ScenePosition {
		return dataModelToPosition(this.scene.origin);
	}

	get size(): ClientSize {
		return dataModelToSize(this.scene.size);
	}

	// Commands
	setZoom(zoom: number): void {
		this.store.dispatch(sceneActions.setZoom(zoom));
	}

	setOrigin(origin: ScenePosition): void {
		this.store.dispatch(sceneActions.setOrigin(positionToDataModel(origin)));
	}

	setSize(size: ClientSize): void {
		this.store.dispatch(sceneActions.setSize(sizeToDataModel(size)));
	}

	subscribe(listener: () => void): () => void {
		return this.store.subscribe(listener);
	}
}
