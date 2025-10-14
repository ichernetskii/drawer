import { makeAutoObservable, reaction } from "mobx";

import type { Position, Size, Storable } from "@/shared/types/types";
import { debounce } from "@/shared/utils/debounce.ts";
import { Storage } from "@/shared/utils/storage.ts";
import type { Drawable } from "@/store/entity/drawable/drawable.ts";
import { createEntity } from "@/store/entity/utils.ts";

type StoredDrawable = Pick<Drawable, "position" | "size" | "color" | "borderWidth"> & { type: string };
interface StoredDrawableStore {
	drawables: StoredDrawable[];
}

export class DrawableStore implements Storable {
	private _drawables: Drawable[] = [];
	private _drawing: Drawable | null = null;
	private storage = new Storage<StoredDrawableStore>("drawableStore");

	constructor() {
		makeAutoObservable<this>(this, {}, { autoBind: true });

		reaction(
			() =>
				this.drawables.map(drawable => [
					drawable.position,
					drawable.size,
					drawable.color,
					drawable.borderWidth,
				]),
			() => this.save(),
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
		const serializedDrawables: StoredDrawable[] = this.drawables.map(drawable => ({
			type: (drawable.constructor as typeof Drawable).type,
			position: drawable.position,
			size: drawable.size,
			color: drawable.color,
			borderWidth: drawable.borderWidth,
		}));

		this.storage.save({ drawables: serializedDrawables });
	}, 1000);

	load = () => {
		const data = this.storage.load();
		if (!data) return;

		const restoredDrawables: Drawable[] = [];

		for (const serialized of data.drawables) {
			const drawable = createEntity(serialized.type);

			if (drawable) {
				drawable.position = serialized.position;
				drawable.size = serialized.size;
				drawable.color = serialized.color;
				drawable.borderWidth = serialized.borderWidth;
				restoredDrawables.push(drawable);
			}
		}

		this.drawables = restoredDrawables;
	};
}
