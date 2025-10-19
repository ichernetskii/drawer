import { action, computed, observable } from "mobx";

import type { Drawable } from "@/store/entity/drawable/drawable.ts";
import { Selection } from "@/store/entity/selection/selection.ts";

/**
 * Visual highlight that appears when hovering over a drawable.
 * Renders an outline around the drawable's geometric shape.
 */
export class SelectionHover extends Selection {
	static readonly type = "selectionHover";

	// The drawable being hovered
	@observable private accessor _drawable: Drawable | null = null;
	@observable private accessor _zoom = 1;

	@computed get drawable() {
		return this._drawable;
	}

	@action set drawable(value) {
		this._drawable = value;
	}

	@computed get zoom() {
		return this._zoom;
	}

	@action set zoom(value: number) {
		this._zoom = value;
	}
}

export function isSelectionHover(selection: Selection): selection is SelectionHover {
	return selection instanceof SelectionHover;
}
