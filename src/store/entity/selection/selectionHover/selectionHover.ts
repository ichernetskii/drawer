import { makeObservable, observable } from "mobx";

import type { Drawable } from "@/store/entity/drawable/drawable.ts";
import { Selection } from "@/store/entity/selection/selection.ts";

/**
 * Visual highlight that appears when hovering over a drawable.
 * Renders an outline around the drawable's geometric shape.
 */
export class SelectionHover extends Selection {
	static readonly type = "selectionHover";

	// The drawable being hovered
	private _drawable: Drawable | null = null;
	private _zoom = 1;

	constructor() {
		super();
		makeObservable<this, "_drawable" | "_zoom">(this, {
			_drawable: observable,
			_zoom: observable,
		});
	}
	get drawable() {
		return this._drawable;
	}

	get zoom() {
		return this._zoom;
	}

	set zoom(value: number) {
		this._zoom = value;
	}

	/**
	 * Updates hover to match the drawable's geometry, accounting for border width.
	 */
	updateFromDrawable(drawable: Drawable | null) {
		this._drawable = drawable;

		if (!drawable) return;

		if (!drawable.position || !drawable.size) {
			this.position = null;
			this.size = null;
			return;
		}

		// Copy position and size from drawable
		this.position = { ...drawable.position };
		this.size = { ...drawable.size };

		// Inherit drawable's border width for proper outline rendering
		this.borderWidth = drawable.borderWidth;
	}
}

export function isSelectionHover(selection: Selection): selection is SelectionHover {
	return selection instanceof SelectionHover;
}
