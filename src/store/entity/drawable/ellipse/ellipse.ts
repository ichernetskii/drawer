import { Drawable } from "@/store/entity/drawable/drawable.ts";
import type { Entity } from "@/store/entity/entity.ts";
import type { Position } from "@/types/types";

export class Ellipse extends Drawable {
	static readonly type = "ellipse";

	/**
	 * Checks if a point is inside the ellipse.
	 * Uses the standard ellipse equation: ((x - cx) / rx)² + ((y - cy) / ry)² <= 1
	 */
	isPointInside(point: Position): boolean {
		if (!this.position || !this.size) return false;

		// Calculate center and radiuses
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
