import type { Drawable, DrawableStorable } from "@/domain/entity/drawable/Drawable.ts";
import { createDrawable } from "@/infrastructure/factories/EntityFactory.ts";

/**
 * Serializes a single drawable to plain data object.
 * Uses the drawable's toStorable() method for polymorphic serialization.
 */
function serializeDrawable(drawable: Drawable): DrawableStorable {
	return drawable.toStorable();
}

/**
 * Deserializes plain data object to a drawable entity.
 * Uses the drawable's fromStorable() method for polymorphic deserialization.
 */
function deserializeDrawable(data: DrawableStorable): Drawable {
	const drawable = createDrawable(data.type);
	drawable.fromStorable(data);
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
