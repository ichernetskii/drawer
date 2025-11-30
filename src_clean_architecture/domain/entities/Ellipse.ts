import { Entity } from "@domain/entities/Entity.ts";
import type { ScenePosition } from "@domain/value-objects/Position.ts";

export class Ellipse extends Entity {
	static override readonly type = "ellipse" as const;
	declare getType: () => typeof Ellipse.type;

	override isPointInside(point: ScenePosition): boolean {
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
