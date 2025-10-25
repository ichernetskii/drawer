import { makeAutoObservable } from "mobx";

import type { Drawable } from "@/domain/entities/drawable/Drawable";
import type { DrawableRepository } from "@/infrastructure/persistence/DrawableRepository";
import type { Position, Size, Storable } from "@/shared/types/types";
import { debounce } from "@/shared/utils/debounce.ts";

export class DrawableStore implements Storable {
	private repository: DrawableRepository;

	private _drawables: Drawable[] = [];
	private _drawing: Drawable | null = null;

	constructor(repository: DrawableRepository) {
		this.repository = repository;
		makeAutoObservable(this);
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

	save = debounce(() => {
		this.repository.save(this.drawables);
	}, 1000);

	load = () => {
		const loadedDrawables = this.repository.load();
		if (loadedDrawables.length > 0) {
			this.drawables = loadedDrawables;
		}
	};
}
