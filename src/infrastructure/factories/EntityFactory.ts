import { toJS } from "mobx";

import { Drawable } from "@/domain/entities/drawable/Drawable";
import { Ellipse } from "@/domain/entities/drawable/ellipse/Ellipse.ts";
import { Rectangle } from "@/domain/entities/drawable/rectangle/Rectangle.ts";
import { Grid } from "@/domain/entities/grid/Grid.ts";
import { SelectionBox } from "@/domain/entities/selection/selectionBox/SelectionBox.ts";
import { SelectionHover } from "@/domain/entities/selection/selectionHover/SelectionHover.ts";
import { SelectionPreview } from "@/domain/entities/selection/selectionPreview/SelectionPreview.ts";
import { makeObservableAuto } from "@/infrastructure/factories/makeObservableAuto.ts";

// ========== Drawable Factories ==========

export function createDrawable(type: (typeof Drawable)["type"]): Drawable {
	let drawable: Drawable;

	switch (type) {
		case Rectangle.type:
			drawable = new Rectangle();
			break;
		case Ellipse.type:
			drawable = new Ellipse();
			break;
		default:
			throw new Error(`Unknown drawable type: ${type}`);
	}

	return makeObservableAuto(drawable, ["type"]);
}

export function cloneDrawable(drawable: Drawable): Drawable {
	// Create new instance with same prototype
	const clone = Object.create(Object.getPrototypeOf(drawable));

	// Deep copy all properties using structuredClone
	const deepCopied = structuredClone(toJS(drawable));

	// Assign deep copied properties, but create a new instance to get a fresh id
	Object.assign(clone, deepCopied);

	// Call constructor to generate new id
	const Constructor = drawable.constructor as new () => Drawable;
	const newInstance = new Constructor();
	clone.id = newInstance.id;

	return makeObservableAuto(clone, ["type"]);
}

// ========== Selection Factories ==========

export function createSelectionBox(): SelectionBox {
	const box = new SelectionBox();
	return makeSelectionBoxObservable(box);
}

export function createSelectionPreview(): SelectionPreview {
	const preview = new SelectionPreview();
	return makeSelectionObservable(preview);
}

export function createSelectionHover(): SelectionHover {
	const hover = new SelectionHover();
	return makeSelectionHoverObservable(hover);
}

function makeSelectionObservable<T extends SelectionPreview | SelectionBox>(selection: T): T {
	return makeObservableAuto(selection, ["type"]);
}

function makeSelectionBoxObservable(box: SelectionBox): SelectionBox {
	return makeObservableAuto(box, ["type"]);
}

function makeSelectionHoverObservable(hover: SelectionHover): SelectionHover {
	return makeObservableAuto(hover, ["type"]);
}

// ========== Grid Factory ==========

export function createGrid(): Grid {
	const grid = new Grid();
	return makeObservableAuto(grid, ["type"]);
}
