import { makeAutoObservable } from "mobx";

import type { Drawable } from "@/store/entity/drawable/drawable.ts";
import { SelectionBox } from "@/store/entity/selection/selectionBox/selectionBox.ts";
import type { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";
import type { Position } from "@/types/types";

export class SelectionStore {
	/*
	S░░░░░░░░░░░░░░░░░ SelectionBox.borderWidth ░░░░░░░░░░░░░░░░░░░
	░                    SelectionBox.padding                     ░
	░  E█████████████████ Entity.borderWidth ███████████████████  ░
	░  █                                                       █  ░
	░  █                        CONTENT                        █  ░
	░  █                                                       █  ░
	░  █████████████████████████████████████████████████████████  ░
	░                                                             ░
	░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
	
	E - Entity.position
	S - SelectionBox.position
	BORDER INCLUSIVE: Entity.position and Entity.size define the position and size of the entity WITH BORDER on the scene
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

	get selectionBox(): SelectionBox | null {
		const first = this.drawables[0];
		if (!first || !first.position || !first.size) return null;

		const box = new SelectionBox();

		box.size = { ...first.size };
		box.position = { ...first.position };
		box.borderWidth /= this.zoom;
		box.padding /= this.zoom;

		// selection box is calculated as the smallest rectangle that contains all the selected drawables
		this.drawables.forEach(drawable => {
			if (!drawable.position || !drawable.size || !box || !box.position || !box.size) return null;

			const top = Math.max(box.position.y + box.size.height, drawable.position.y + drawable.size.height);
			const bottom = Math.min(box.position.y, drawable.position.y);
			const left = Math.min(box.position.x, drawable.position.x);
			const right = Math.max(box.position.x + box.size.width, drawable.position.x + drawable.size.width);
			box.position.x = left - box.borderWidth - box.padding;
			box.position.y = bottom - box.borderWidth - box.padding;
			box.size.width = right - left + 2 * box.borderWidth + 2 * box.padding;
			box.size.height = top - bottom + 2 * box.borderWidth + 2 * box.padding;
		});

		return box;
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

	getPositionOnEdgeOfSelection(sceneCoordinates: Position): "top" | "bottom" | "left" | "right" | null {
		if (!this.selectionBox || !this.selectionBox.position) return null;
		// check if the position is on rectangle border of the selection box with the precision
		const { position, size, borderWidth } = this.selectionBox;
		if (!size) return null;

		const precisionScene = this.selectionPrecision / this.zoom;

		const left = position.x + borderWidth / 2;
		const right = position.x + size.width - borderWidth / 2;
		const bottom = position.y + borderWidth / 2;
		const top = position.y + size.height - borderWidth / 2;

		const { x, y } = sceneCoordinates;

		const onLeft =
			Math.abs(x - left) <= precisionScene && y >= bottom - precisionScene && y <= top + precisionScene;
		const onRight =
			Math.abs(x - right) <= precisionScene && y >= bottom - precisionScene && y <= top + precisionScene;
		const onBottom =
			Math.abs(y - bottom) <= precisionScene && x >= left - precisionScene && x <= right + precisionScene;
		const onTop = Math.abs(y - top) <= precisionScene && x >= left - precisionScene && x <= right + precisionScene;

		if (onLeft) return "left";
		if (onRight) return "right";
		if (onTop) return "top";
		if (onBottom) return "bottom";
		return null;
	}
}
