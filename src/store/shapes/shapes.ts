import { makeAutoObservable } from "mobx";

import type { Position } from "@/types/types";

import type { Entity } from "./entities/entity.ts";

export class Shapes {
	private _entities: Entity[] = [];
	private _drawingEntity: Entity | null = null;

	constructor() {
		makeAutoObservable(
			this,
			{},
			{
				autoBind: true,
			},
		);
	}

	get entities() {
		return this._entities;
	}

	setEntities(entities: Entity[]) {
		this._entities = entities;
	}

	addEntity(entity: Entity) {
		this._entities.push(entity);
	}

	get drawingEntity() {
		return this._drawingEntity;
	}

	setDrawingEntity(drawingEntity: Entity | null) {
		this._drawingEntity = drawingEntity;
	}

	getEntityUnderCursor(position: Position) {
		for (let i = this.entities.length - 1; i >= 0; i--) {
			const entity = this.entities[i];
			if (!entity.position || !entity.size) continue;
			if (
				entity.position.x <= position.x &&
				position.x <= entity.position.x + entity.size.width &&
				entity.position.y <= position.y &&
				position.y <= entity.position.y + entity.size.height
			) {
				return entity;
			}
		}
		return null;
	}

	unselectEntities() {
		for (const entity of this.entities) {
			entity.setIsSelected(false);
		}
	}
}
