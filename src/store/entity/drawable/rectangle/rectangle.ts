import { Drawable } from "@/store/entity/drawable/drawable.ts";
import type { Entity } from "@/store/entity/entity.ts";

export class Rectangle extends Drawable {
	static readonly type = "rectangle";
}

export function isRectangle(entity: Entity): entity is Rectangle {
	return entity instanceof Rectangle;
}
