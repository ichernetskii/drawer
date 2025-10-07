import { makeAutoObservable } from "mobx";

import type { Entity } from "@/store/entities/entity.ts";
import { Selection } from "@/store/entities/selection.ts";

export class SelectionStore {
	private _entities: Entity[] = [];
	private readonly selectionBoxPadding = 0;

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

	set entities(entities) {
		this._entities = entities;
	}

	add(entity: Entity) {
		this.entities.push(entity);
	}

	delete(entity: Entity) {
		this.entities = this.entities.filter(selectedEntity => selectedEntity !== entity);
	}

	getEntitiesBox(zoom: number): Selection | null {
		const firstEntity = this.entities[0];
		if (!firstEntity || !firstEntity.position || !firstEntity.size) return null;

		const selection = new Selection();
		selection.size = { ...firstEntity.size };
		selection.position = { ...firstEntity.position };
		selection.borderWidth = selection.baseBorderWidth / zoom;

		// selection box is calculated as the smallest rectangle that contains all the selected entities
		this.entities.forEach(entity => {
			if (!entity.position || !entity.size || !selection.position || !selection.size) return null;
			const top = Math.max(selection.position.y + selection.size.height, entity.position.y + entity.size.height);
			const bottom = Math.min(selection.position.y, entity.position.y);
			const left = Math.min(selection.position.x, entity.position.x);
			const right = Math.max(selection.position.x + selection.size.width, entity.position.x + entity.size.width);
			selection.position.x = left;
			selection.position.y = bottom;
			selection.size.width = right - left;
			selection.size.height = top - bottom;
		});

		selection.position.x -= this.selectionBoxPadding;
		selection.position.y -= this.selectionBoxPadding;
		selection.size.width += 2 * this.selectionBoxPadding;
		selection.size.height += 2 * this.selectionBoxPadding;

		return selection;
	}
}
