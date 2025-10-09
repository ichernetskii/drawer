import { makeAutoObservable } from "mobx";

import type { Drawable } from "@/store/entity/drawable/drawable.ts";
import { SelectionBox } from "@/store/entity/selection/selectionBox/selectionBox.ts";
import type { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";

export class SelectionStore {
	private _drawables: Drawable[] = [];
	private _selectionPreview: SelectionPreview | null = null;
	private readonly selectionBoxPadding = 0;

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

	add(drawable: Drawable) {
		this.drawables.push(drawable);
	}

	addMany(drawables: Drawable[]) {
		this.drawables.push(...drawables);
	}

	delete(drawable: Drawable) {
		this.drawables = this.drawables.filter(selectedDrawable => selectedDrawable !== drawable);
	}

	get selectionPreview() {
		return this._selectionPreview;
	}

	set selectionPreview(value) {
		this._selectionPreview = value;
	}

	getSelectionBox(zoom: number): SelectionBox | null {
		const first = this.drawables[0];
		if (!first || !first.position || !first.size) return null;

		const selection = new SelectionBox();
		selection.size = { ...first.size };
		selection.position = { ...first.position };
		selection.borderWidth = selection.baseBorderWidth / zoom;

		// selection box is calculated as the smallest rectangle that contains all the selected drawables
		this.drawables.forEach(drawable => {
			if (!drawable.position || !drawable.size || !selection.position || !selection.size) return null;
			const top = Math.max(
				selection.position.y + selection.size.height,
				drawable.position.y + drawable.size.height,
			);
			const bottom = Math.min(selection.position.y, drawable.position.y);
			const left = Math.min(selection.position.x, drawable.position.x);
			const right = Math.max(
				selection.position.x + selection.size.width,
				drawable.position.x + drawable.size.width,
			);
			selection.position.x = left;
			selection.position.y = bottom;
			selection.size.width = right - left;
			selection.size.height = top - bottom;
		});

		selection.position.x -= this.selectionBoxPadding;
		selection.position.y -= this.selectionBoxPadding;
		selection.size.width += 2 * this.selectionBoxPadding;
		selection.size.height += 2 * this.selectionBoxPadding;

		return selection;
	}
}
