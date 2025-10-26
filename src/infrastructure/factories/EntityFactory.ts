import { Drawable } from "@/domain/entity/drawable/Drawable.ts";
import { Ellipse } from "@/domain/entity/drawable/ellipse/Ellipse.ts";
import { Rectangle } from "@/domain/entity/drawable/rectangle/Rectangle.ts";
import { Grid } from "@/domain/entity/grid/Grid.ts";
import { SelectionBox } from "@/domain/entity/selection/selectionBox/SelectionBox.ts";
import { SelectionHover } from "@/domain/entity/selection/selectionHover/SelectionHover.ts";
import { SelectionPreview } from "@/domain/entity/selection/selectionPreview/SelectionPreview.ts";
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
	// Use domain's clone method to create a plain copy
	const plainCopy = drawable.clone();

	// Wrap with MobX observable
	return makeObservableAuto(plainCopy, ["type"]);
}

// ========== Selection Factories ==========

export function createSelectionBox(): SelectionBox {
	const box = new SelectionBox();
	return makeObservableAuto(box, ["type"]);
}

export function createSelectionPreview(): SelectionPreview {
	const preview = new SelectionPreview();
	return makeObservableAuto(preview, ["type"]);
}

export function createSelectionHover(): SelectionHover {
	const hover = new SelectionHover();
	return makeObservableAuto(hover, ["type"]);
}

// ========== Grid Factory ==========

export function createGrid(): Grid {
	const grid = new Grid();
	return makeObservableAuto(grid, ["type"]);
}
