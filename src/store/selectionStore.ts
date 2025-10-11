import { makeAutoObservable } from "mobx";

import type { Drawable } from "@/store/entity/drawable/drawable.ts";
import { SelectionBox } from "@/store/entity/selection/selectionBox/selectionBox.ts";
import type { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";
import type { Position } from "@/types/types";

export class SelectionStore {
	/*
	+===================================================================+
	|<<<<<<<<<<<< SelectionBox.borderWidth (inside the frame) >>>>>>>>>>|   // 1
	| +---------------------------------------------------------------+ |
	| |         ~~~~~ SelectionBox.padding (gap to content) ~~~~~     | |   // 2
	| |   +-------------------------------------------------------+   | |
	| |   |                    Drawable (outer)                   |   | |   // 3: Drawable.position (top-left of this box)
	| |   |  <<<<<< Drawable.borderWidth (inside the shape) >>>>  |   | |   // 1 (Drawable)
	| |   |   +-----------------------------------------------+   |   | |
	| |   |   |                  CONTENT                      |   |   | |   // content area inside Drawable.borderWidth
	| |   |   +-----------------------------------------------+   |   | |
	| |   +-------------------------------------------------------+   | |   // 3: Drawable.size (outer size of Drawable)
	| +---------------------------------------------------------------+ |   // 4: SelectionBox.size (outer size of selection box)
	+===================================================================+   // 3: SelectionBox.position (top-left of outer frame)
	*/
	private readonly selectionPrecision = 5; // in scene pixels

	private _drawables: Drawable[] = [];
	private _selectionPreview: SelectionPreview | null = null;
	private _mouseDown: Position | null = null;
	private _zoom = 1;

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

	get mouseDown() {
		return this._mouseDown;
	}

	set mouseDown(value) {
		this._mouseDown = value;
	}

	get zoom() {
		return this._zoom;
	}

	set zoom(value) {
		this._zoom = value;
	}

	isPositionOnEdgeOfSelection(sceneCoordinates: Position) {
		// TODO: add selectionBox.padding support!!!

		const selectionBox = this.getSelectionBox();
		if (!selectionBox || !selectionBox.position) return false;
		// check if the position is on rectangle border of the selection box with the precision
		const { position, size, borderWidth } = selectionBox;
		if (!size) return false;

		const halfStroke = borderWidth / 2;
		const precisionScene = this.selectionPrecision / this.zoom;
		const hit = halfStroke + precisionScene;

		const left = position.x;
		const right = position.x + size.width;
		const bottom = position.y;
		const top = position.y + size.height;

		const x = sceneCoordinates.x;
		const y = sceneCoordinates.y;

		const onLeft = Math.abs(x - left) <= hit && y >= bottom - hit && y <= top + hit;
		const onRight = Math.abs(x - right) <= hit && y >= bottom - hit && y <= top + hit;
		const onBottom = Math.abs(y - bottom) <= hit && x >= left - hit && x <= right + hit;
		const onTop = Math.abs(y - top) <= hit && x >= left - hit && x <= right + hit;

		return onLeft || onRight || onBottom || onTop;
	}

	getSelectionBox(): SelectionBox | null {
		const first = this.drawables[0];
		if (!first || !first.position || !first.size) return null;

		const selection = new SelectionBox();
		selection.size = { ...first.size };
		selection.position = { ...first.position };
		selection.borderWidth /= this.zoom;

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
			selection.position.x = left - selection.borderWidth - selection.padding;
			selection.position.y = bottom - selection.borderWidth - selection.padding;
			selection.size.width = right - left + 2 * selection.borderWidth + 2 * selection.padding;
			selection.size.height = top - bottom + 2 * selection.borderWidth + 2 * selection.padding;
		});

		return selection;
	}
}
