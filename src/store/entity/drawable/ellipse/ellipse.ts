import { Drawable } from "@/store/entity/drawable/drawable.ts";
import type { Entity } from "@/store/entity/entity.ts";

export class Ellipse extends Drawable {
	static readonly type = "ellipse";
}

export function isEllipse(entity: Entity): entity is Ellipse {
	return entity instanceof Ellipse;
}
