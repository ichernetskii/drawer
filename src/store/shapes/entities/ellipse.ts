import { Entity } from "./entity.ts";

export class Ellipse extends Entity {
	readonly type = "ellipse";
}

export function isEllipse(entity: Entity): entity is Ellipse {
	return entity.type === "ellipse";
}
