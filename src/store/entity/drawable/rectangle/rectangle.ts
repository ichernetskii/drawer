import type { Position } from "@/shared/types/types";
import { Drawable } from "@/store/entity/drawable/drawable.ts";
import type { Entity } from "@/store/entity/entity.ts";

export class Rectangle extends Drawable {
	static readonly type = "rectangle";

	isPointInside(point: Position): boolean {
		if (!this.position || !this.size) return false;

		return (
			point.x >= this.position.x &&
			point.x <= this.position.x + this.size.width &&
			point.y >= this.position.y &&
			point.y <= this.position.y + this.size.height
		);
	}

	duplicate(): Rectangle {
		const copy = new Rectangle();
		if (this.position) {
			copy.position = { ...this.position };
		}
		if (this.size) {
			copy.size = { ...this.size };
		}
		copy.color = this.color;
		copy.borderWidth = this.borderWidth;
		return copy;
	}
}

export function isRectangle(entity: Entity): entity is Rectangle {
	return entity instanceof Rectangle;
}
