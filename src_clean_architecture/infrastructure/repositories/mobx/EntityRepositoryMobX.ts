import { Entity, type IEntityRepository, Size } from "@domain";
import type { IReactiveRepository } from "@infrastructure/repositories/IReactiveRepository.d.ts";
import { makeObservableAuto } from "@infrastructure/repositories/mobx/makeObservableAuto.ts";
import { autorun, isObservable, makeAutoObservable } from "mobx";

export class EntityRepositoryMobX implements IEntityRepository, IReactiveRepository {
	private _entities: Entity[] = [];
	private _drawingEntity: Entity | null = null;

	constructor() {
		makeAutoObservable(this);
	}

	// Queries
	getAll(): Entity[] {
		return this._entities;
	}

	get drawingEntity() {
		return this._drawingEntity;
	}

	// Commands
	add(entity: Entity) {
		if (!isObservable(entity)) makeObservableAuto(entity);
		this._entities.push(entity);
	}

	remove(id: string) {
		this._entities = this._entities.filter(entity => entity.id !== id);
	}

	clear() {
		this._entities.length = 0;
	}

	setDrawingEntity(drawingEntity: Entity | null) {
		if (drawingEntity && !isObservable(drawingEntity)) {
			makeObservableAuto(drawingEntity);
		}

		this._drawingEntity = drawingEntity;
	}

	setSize(entity: Entity, size: Size) {
		entity.size = size;
	}

	subscribe(listener: () => void): () => void {
		return autorun(() => {
			listener();
		});
	}
}
