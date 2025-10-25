import type { Drawable } from "@/domain/entities/drawable/Drawable.ts";
import { Selection } from "@/domain/entities/selection/Selection.ts";

/**
 * Visual highlight that appears when hovering over a drawable.
 * Renders an outline around the drawable's geometric shape.
 */
export class SelectionHover extends Selection {
	static readonly type = "selectionHover";

	protected _drawable: Drawable | null = null;
	protected _zoom = 1;

	get drawable(): Drawable | null {
		return this._drawable;
	}

	get zoom(): number {
		return this._zoom;
	}

	// Mutation methods
	setDrawable(value: Drawable | null) {
		this._drawable = value;
	}

	setZoom(value: number) {
		this._zoom = value;
	}
}

export function isSelectionHover(selection: Selection): selection is SelectionHover {
	return selection instanceof SelectionHover;
}
