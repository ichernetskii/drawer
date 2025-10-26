import { Entity } from "@/domain/entity/Entity.ts";
import type { Position, Size } from "@/shared/types/types.d.ts";

const getId = (() => {
	let counter = 0;
	return () => counter++;
})();

export interface DrawableStorable {
	type: string;
	position: Position | null;
	size: Size | null;
	color: string;
	borderWidth: number;
}

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

	/**
	 * Serializes the drawable to a plain data object.
	 * Subclasses should override to include additional fields.
	 */
	toStorable(): DrawableStorable {
		return {
			type: this.type,
			position: this.position,
			size: this.size,
			color: this.color,
			borderWidth: this.borderWidth,
		};
	}

	/**
	 * Restores drawable state from a plain data object.
	 * Subclasses should override to restore additional fields.
	 */
	fromStorable(data: DrawableStorable): void {
		this.setPosition(data.position);
		this.setSize(data.size);
		this.setColor(data.color);
		this.setBorderWidth(data.borderWidth);
	}

	/**
	 * Creates a plain copy of the drawable (not observable).
	 * Uses toStorable() and fromStorable() for copying.
	 * Subclasses don't need to override this method if they properly implement toStorable/fromStorable.
	 */
	clone(): Drawable {
		const data = this.toStorable();
		const copy = new (this.constructor as new () => Drawable)();
		copy.fromStorable(data);
		return copy;
	}
}

export function isDrawable(entity: Entity): entity is Drawable {
	return entity instanceof Drawable;
}
