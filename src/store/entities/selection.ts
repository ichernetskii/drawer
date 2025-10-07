import { Entity } from "./entity.ts";

export class Selection extends Entity {
	readonly baseBorderWidth = 0.5;

	constructor() {
		super();
		this.color = "rgb(64,255,0)";
	}
}

export function isSelection(entity: Entity): entity is Selection {
	return entity instanceof Selection;
}
