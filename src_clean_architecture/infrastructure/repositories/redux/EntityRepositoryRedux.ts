import { dataModelToEntity, entityToDataModel, sizeToDataModel } from "@adapters";
import type { Entity, IEntityRepository, SceneSize, Tool } from "@domain";
import type { IReactiveRepository } from "@infrastructure/repositories/IReactiveRepository.d.ts";

import { entityActions } from "./store/entitySlice.ts";
import { type IEntityStoreRedux } from "./store/store.ts";

export class EntityRepositoryRedux implements IEntityRepository, IReactiveRepository {
	private store: IEntityStoreRedux;

	constructor(store: IEntityStoreRedux) {
		this.store = store;
	}

	// Queries
	get entities(): Entity[] {
		return this.store.getState().entities.map(dataModelToEntity);
	}

	get drawingEntity(): Entity | null {
		const { drawingEntity } = this.store.getState();
		if (drawingEntity) {
			return dataModelToEntity(drawingEntity);
		}
		return null;
	}

	get tool(): Tool {
		return this.store.getState().tool;
	}

	// Commands
	addEntity(entity: Entity): void {
		this.store.dispatch(entityActions.add(entityToDataModel(entity)));
	}

	removeEntity(id: string): void {
		this.store.dispatch(entityActions.remove(id));
	}

	clearEntities(): void {
		this.store.dispatch(entityActions.clear());
	}

	setDrawingEntity(drawingEntity: Entity | null): void {
		this.store.dispatch(entityActions.setDrawingEntity(drawingEntity ? entityToDataModel(drawingEntity) : null));
	}

	setEntitySize(id: string, size: SceneSize): void {
		this.store.dispatch(
			entityActions.setSize({
				id: id,
				size: sizeToDataModel(size),
			}),
		);
	}

	setTool(tool: Tool) {
		this.store.dispatch(entityActions.setTool(tool));
	}

	subscribe(listener: () => void): () => void {
		return this.store.subscribe(listener);
	}
}
