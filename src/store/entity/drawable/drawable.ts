import { Entity } from "@/store/entity/entity.ts";

export abstract class Drawable extends Entity {
	static readonly type: string = "drawable";
}

export function isDrawable(entity: Entity): entity is Drawable {
	return entity instanceof Drawable;
}
