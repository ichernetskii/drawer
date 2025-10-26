import { Drawable } from "@/domain/entity/drawable/Drawable.ts";
import type { Entity } from "@/domain/entity/Entity.ts";
import type { Position } from "@/shared/types/types.d.ts";

export class Rectangle extends Drawable {
	static readonly type = "rectangle";

	override isPointInside(point: Position): boolean {
		if (!this.position || !this.size) return false;

		return (
			point.x >= this.position.x &&
			point.x <= this.position.x + this.size.width &&
			point.y >= this.position.y &&
			point.y <= this.position.y + this.size.height
		);
	}
}

export function isRectangle(entity: Entity): entity is Rectangle {
	return entity instanceof Rectangle;
}
