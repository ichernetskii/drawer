import { Entity, type IEntityRepository, Rectangle, SceneSize, type Tool } from "@domain";
import type { IReactiveRepository } from "@infrastructure/repositories/IReactiveRepository.d.ts";
import { makeObservableAuto } from "@infrastructure/repositories/mobx/makeObservableAuto.ts";
import { comparer, isObservable, makeAutoObservable, reaction, toJS } from "mobx";

export class EntityRepositoryMobX implements IEntityRepository, IReactiveRepository {
	private _entities: Entity[] = [];
	private _drawingEntity: Entity | null = null;
	private _tool: Tool = Rectangle.type;

	constructor() {
		makeAutoObservable(this);
	}

	// Queries
	get entities(): Entity[] {
		return this._entities;
	}

	get drawingEntity() {
		return this._drawingEntity;
	}

	get tool() {
		return this._tool;
	}

	// Commands
	addEntity(entity: Entity) {
		if (!isObservable(entity)) makeObservableAuto(entity);
		this._entities.push(entity);
	}

	removeEntity(id: string) {
		this._entities = this._entities.filter(entity => entity.id !== id);
	}

	clearEntities() {
		this._entities.length = 0;
	}

	setDrawingEntity(drawingEntity: Entity | null) {
		if (drawingEntity && !isObservable(drawingEntity)) {
			makeObservableAuto(drawingEntity);
		}

		this._drawingEntity = drawingEntity;
	}

	setEntitySize(id: string, size: SceneSize) {
		const entity = this._entities.find(entity => entity.id === id) ?? this._drawingEntity;
		if (entity) {
			entity.size = size;
		}
	}

	setTool(tool: Tool) {
		this._tool = tool;
	}

	subscribe(listener: () => void): () => void {
		return reaction(
			() => toJS(this),
			() => {
				listener();
			},
			{
				equals: comparer.structural,
				fireImmediately: true,
			},
		);
	}
}
