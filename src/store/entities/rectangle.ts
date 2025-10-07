import { Entity } from "./entity.ts";

export class Rectangle extends Entity {
	constructor() {
		super();
	}
}

export function isRectangle(entity: Entity): entity is Rectangle {
	return entity instanceof Rectangle;
}
