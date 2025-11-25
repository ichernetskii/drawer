import { dataModelToEntity, entityToDataModel, sizeToDataModel } from "@adapters";
import { type Entity, type IEntityRepository, type Size } from "@domain";
import type { IReactiveRepository } from "@infrastructure/repositories/IReactiveRepository.d.ts";

import { entityActions } from "./store/entitySlice.ts";
import { type IEntityStoreRedux } from "./store/store.ts";

export class EntityRepositoryRedux implements IEntityRepository, IReactiveRepository {
	private store: IEntityStoreRedux;

	constructor(store: IEntityStoreRedux) {
		this.store = store;
	}

	// Queries
	getAll(): Entity[] {
		return this.store.getState().entities.map(dataModelToEntity);
	}

	get drawingEntity(): Entity | null {
		const { drawingEntity } = this.store.getState();
		if (drawingEntity) {
			return dataModelToEntity(drawingEntity);
		}
		return null;
	}

	// Commands
	add(entity: Entity): void {
		this.store.dispatch(entityActions.add(entityToDataModel(entity)));
	}

	remove(id: string): void {
		this.store.dispatch(entityActions.remove(id));
	}

	clear(): void {
		this.store.dispatch(entityActions.clear());
	}

	setDrawingEntity(drawingEntity: Entity | null): void {
		this.store.dispatch(entityActions.setDrawingEntity(drawingEntity ? entityToDataModel(drawingEntity) : null));
	}

	setSize(entity: Entity, size: Size): void {
		this.store.dispatch(
			entityActions.setSize({
				entity: entityToDataModel(entity),
				size: sizeToDataModel(size),
			}),
		);
	}

	subscribe(listener: () => void): () => void {
		return this.store.subscribe(listener);
	}
}
