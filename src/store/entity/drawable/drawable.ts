import type { PickFields, Position } from "@/shared/types/types";
import { Entity } from "@/store/entity/entity.ts";

export type DrawableSerializable = PickFields<Drawable, "type" | "size" | "position" | "color" | "borderWidth">;

const getId = (() => {
	let counter = 0;
	return () => counter++;
})();

export class Drawable extends Entity {
	static type: string = "drawable";
	readonly id: number;

	// Configuration for hover highlight
	static readonly hoverColor = "rgba(253,0,0,0.8)"; // Cornflower blue with transparency
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

	duplicate(): Drawable {
		const Constructor = this.constructor as typeof Drawable;
		const copy = new Constructor();
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

	toSerializable(): DrawableSerializable {
		return {
			type: this.type,
			position: this.position,
			size: this.size,
			color: this.color,
			borderWidth: this.borderWidth,
		};
	}

	fromSerializable(serializable: DrawableSerializable): Drawable {
		(this.constructor as typeof Drawable).type = serializable.type;
		this.size = serializable.size;
		this.position = serializable.position;
		this.color = serializable.color;
		this.borderWidth = serializable.borderWidth;
		return this;
	}
}

export function isDrawable(entity: Entity): entity is Drawable {
	return entity instanceof Drawable;
}
