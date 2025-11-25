import {
	dataModelToPosition,
	dataModelToSize,
	type ISceneRepository,
	positionToDataModel,
	sizeToDataModel,
	type Tool,
} from "@adapters";
import { Position, Size } from "@domain";
import type { IReactiveRepository } from "@infrastructure/repositories/IReactiveRepository.d.ts";

import { sceneActions } from "./store/sceneSlice.ts";
import { type ISceneStoreRedux } from "./store/store.ts";

export class SceneRepositoryRedux implements ISceneRepository, IReactiveRepository {
	private store: ISceneStoreRedux;

	constructor(size: Size, store: ISceneStoreRedux) {
		this.store = store;
		this.setSize(size);
	}

	// Queries
	get zoom(): number {
		return this.store.getState().zoom;
	}

	get origin(): Position {
		return dataModelToPosition(this.store.getState().origin);
	}

	get size(): Size {
		return dataModelToSize(this.store.getState().size);
	}

	get tool(): Tool {
		return this.store.getState().tool;
	}

	// Commands
	setZoom(zoom: number): void {
		this.store.dispatch(sceneActions.setZoom(zoom));
	}

	setOrigin(origin: Position): void {
		this.store.dispatch(sceneActions.setOrigin(positionToDataModel(origin)));
	}

	setSize(size: Size): void {
		this.store.dispatch(sceneActions.setSize(sizeToDataModel(size)));
	}

	setTool(tool: Tool): void {
		this.store.dispatch(sceneActions.setTool(tool));
	}

	subscribe(listener: () => void): () => void {
		return this.store.subscribe(listener);
	}
}
