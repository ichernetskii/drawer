import { makeAutoObservable } from "mobx";

import type { Entity } from "./entities/entity.ts";

export class Shapes {
	private entities: Entity[] = [];
	drawingEntity: Entity | null = null;

	constructor() {
		makeAutoObservable(
			this,
			{},
			{
				autoBind: true,
			},
		);
	}

	addEntity(entity: Entity) {
		this.entities.push(entity);
	}

	getEntities() {
		return this.entities;
	}

	setDrawingEntity(drawingEntity: Entity) {
		this.drawingEntity = drawingEntity;
	}

	resetDrawingEntity() {
		this.drawingEntity = null;
	}
}
