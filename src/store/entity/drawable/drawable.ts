import type { Position } from "@/shared/types/types";
import { Entity } from "@/store/entity/entity.ts";

const getId = (() => {
	let counter = 0;
	return () => counter++;
})();

export abstract class Drawable extends Entity {
	static readonly type: string = "drawable";
	readonly id: number;

	// Configuration for hover highlight
	readonly hoverColor = "rgba(253,0,0,0.8)"; // Cornflower blue with transparency
	readonly hoverBorderWidth = 5; // Border width in screen pixels (independent of zoom)

	constructor() {
		super();
		this.id = getId();
	}

	/**
	 * Checks if a point is inside the drawable's geometric shape.
	 * Each drawable must implement its own hit-testing logic.
	 */
	abstract isPointInside(point: Position): boolean;
}

export function isDrawable(entity: Entity): entity is Drawable {
	return entity instanceof Drawable;
}
