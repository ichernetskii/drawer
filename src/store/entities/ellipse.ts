import { Entity } from "./entity.ts";

export class Ellipse extends Entity {
	constructor() {
		super();
	}
}

export function isEllipse(entity: Entity): entity is Ellipse {
	return entity instanceof Ellipse;
}
