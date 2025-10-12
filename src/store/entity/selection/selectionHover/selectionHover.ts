import { computed, makeObservable, observable } from "mobx";

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
			drawable: computed,
			_zoom: observable,
			zoom: computed,
		});
	}
	get drawable() {
		return this._drawable;
	}

	set drawable(value) {
		this._drawable = value;
	}

	get zoom() {
		return this._zoom;
	}

	set zoom(value: number) {
		this._zoom = value;
	}
}

export function isSelectionHover(selection: Selection): selection is SelectionHover {
	return selection instanceof SelectionHover;
}
