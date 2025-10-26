import type { Drawable } from "@/domain/entity/drawable/Drawable.ts";
import { createDrawable } from "@/infrastructure/factories/EntityFactory.ts";

type DrawableStorableKeys = Extract<keyof Drawable, "type" | "position" | "size" | "color" | "borderWidth">;

export type DrawableStorable = Pick<Drawable, DrawableStorableKeys>;

/**
 * Serializes a single drawable to plain data object.
 */
function serializeDrawable(drawable: Drawable): DrawableStorable {
	return {
		type: drawable.type,
		position: drawable.position,
		size: drawable.size,
		color: drawable.color,
		borderWidth: drawable.borderWidth,
	};
}

/**
 * Deserializes plain data object to a drawable entity.
 */
function deserializeDrawable(data: DrawableStorable): Drawable {
	const drawable = createDrawable(data.type);
	drawable.setPosition(data.position);
	drawable.setSize(data.size);
	drawable.setColor(data.color);
	drawable.setBorderWidth(data.borderWidth);
	return drawable;
}

/**
 * Serializes an array of drawables to plain data objects.
 */
export function serializeDrawables(drawables: Drawable[]): DrawableStorable[] {
	return drawables.map(serializeDrawable);
}

/**
 * Deserializes an array of plain data objects to drawable entities.
 */
export function deserializeDrawables(data: DrawableStorable[]): Drawable[] {
	return data.map(deserializeDrawable);
}
