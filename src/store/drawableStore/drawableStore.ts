import { makeAutoObservable } from "mobx";

import type { Drawable } from "@/domain/entities/drawable/Drawable.ts";
import type { Position, Size } from "@/shared/types/types.d.ts";

export class DrawableStore {
	private _drawables: Drawable[] = [];
	private _drawing: Drawable | null = null;

	constructor() {
		makeAutoObservable(this);
	}

	get drawables() {
		return this._drawables;
	}

	setDrawables(value: Drawable[]) {
		this._drawables = value;
	}

	addDrawable(drawable: Drawable) {
		this._drawables.push(drawable);
	}

	deleteDrawables(drawables: Drawable[]) {
		this._drawables = this._drawables.filter(drawable => !drawables.includes(drawable));
	}

	get drawing() {
		return this._drawing;
	}

	setDrawing(value: Drawable | null) {
		this._drawing = value;
	}

	/**
	 * Returns the topmost drawable at the given position.
	 * Uses each drawable's geometric shape for hit-testing, not bounding boxes.
	 */
	getDrawableAtPosition(position: Position) {
		// Iterate from end to start (top to bottom in Z-order)
		for (let i = this.drawables.length - 1; i >= 0; i--) {
			const drawable = this.drawables[i];
			if (drawable.isPointInside(position)) {
				return drawable;
			}
		}
		return null;
	}

	getDrawablesInRectangle(rectangle: { position: Position | null; size: Size | null }): Drawable[] {
		if (!rectangle.position || !rectangle.size) return [];
		const result: Drawable[] = [];

		for (let i = 0; i < this.drawables.length; i++) {
			const drawable = this.drawables[i];
			const { position, size } = drawable;
			if (!position || !size) continue;

			if (
				position.x <= rectangle.position.x + rectangle.size.width &&
				position.x + size.width >= rectangle.position.x &&
				position.y <= rectangle.position.y + rectangle.size.height &&
				position.y + size.height >= rectangle.position.y
			) {
				result.push(drawable);
			}
		}

		return result;
	}
}
