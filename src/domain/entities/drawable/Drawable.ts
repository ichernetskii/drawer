import { Entity } from "@/domain/entities/Entity.ts";
import type { Position } from "@/shared/types/types.d.ts";

const getId = (() => {
	let counter = 0;
	return () => counter++;
})();

export class Drawable extends Entity {
	static type: string = "drawable";
	readonly id: number;

	// Configuration for hover highlight
	static readonly hoverColor = "rgba(253,0,0,0.8)";
	static readonly hoverBorderWidth = 5; // Border width in screen pixels (independent of zoom)

	constructor() {
		super();
		this.id = getId();
	}

	/**
	 * Checks if a point is inside the drawable's geometric shape.
	 * Each drawable must implement its own hit-testing logic.
	 */
	isPointInside(point: Position): boolean {
		throw new Error(`isPointInside must be implemented in subclasses of Drawable. Point: ${point}`);
	}
}

export function isDrawable(entity: Entity): entity is Drawable {
	return entity instanceof Drawable;
}
