import { Entity } from "./entity.ts";

export class Rectangle extends Entity {
	readonly type = "rectangle";
}

export function isRectangle(entity: Entity): entity is Rectangle {
	return entity.type === "rectangle";
}
