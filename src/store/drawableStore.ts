import { makeAutoObservable } from "mobx";

import type { Drawable } from "@/store/entity/drawable/drawable.ts";
import type { Position, Size } from "@/types/types";

export class DrawableStore {
	private _drawables: Drawable[] = [];
	private _drawing: Drawable | null = null;

	constructor() {
		makeAutoObservable(
			this,
			{},
			{
				autoBind: true,
			},
		);
	}

	get drawables() {
		return this._drawables;
	}

	set drawables(value) {
		this._drawables = value;
	}

	addDrawable(drawable: Drawable) {
		this.drawables.push(drawable);
	}

	deleteDrawables(drawables: Drawable[]) {
		this.drawables = this.drawables.filter(drawable => !drawables.includes(drawable));
	}

	get drawing() {
		return this._drawing;
	}

	set drawing(value) {
		this._drawing = value;
	}

	private isPointInsideRectangle(rectangle: { position: Position | null; size: Size | null }, point: Position) {
		if (!rectangle.position || !rectangle.size) return false;
		return (
			rectangle.position.x <= point.x &&
			point.x <= rectangle.position.x + rectangle.size.width &&
			rectangle.position.y <= point.y &&
			point.y <= rectangle.position.y + rectangle.size.height
		);
	}

	getDrawableAtPosition(position: Position) {
		for (let i = this.drawables.length - 1; i >= 0; i--) {
			const drawable = this.drawables[i];
			if (this.isPointInsideRectangle(drawable, position)) {
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
