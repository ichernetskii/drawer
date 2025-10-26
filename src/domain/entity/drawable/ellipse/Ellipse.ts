import { Drawable } from "@/domain/entity/drawable/Drawable.ts";
import type { Entity } from "@/domain/entity/Entity.ts";
import type { Position } from "@/shared/types/types.d.ts";

export class Ellipse extends Drawable {
	static readonly type = "ellipse";

	override isPointInside(point: Position): boolean {
		if (!this.position || !this.size) return false;

		// Uses the standard ellipse equation: ((x - cx) / rx)² + ((y - cy) / ry)² <= 1
		// Calculate center and radius
		const cx = this.position.x + this.size.width / 2;
		const cy = this.position.y + this.size.height / 2;
		const rx = this.size.width / 2;
		const ry = this.size.height / 2;

		// Avoid division by zero
		if (rx === 0 || ry === 0) return false;

		// Check if point is inside ellipse
		const normalizedX = (point.x - cx) / rx;
		const normalizedY = (point.y - cy) / ry;

		return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
	}
}

export function isEllipse(entity: Entity): entity is Ellipse {
	return entity instanceof Ellipse;
}
