import { action, computed, makeObservable, observable } from "mobx";

import type { Position, Size } from "@/types/types";

const getId = (() => {
	let counter = 0;
	return () => counter++;
})();

export type EntityType = "rectangle" | "ellipse";

export class Entity {
	readonly id: number;
	readonly type: EntityType;
	protected _position: Position | null = null;
	protected _size: Size | null = null;
	protected _isSelected: boolean = false;
	protected _color: string = "#fff";

	constructor(type: EntityType) {
		this.id = getId();
		this.type = type;
		makeObservable<this, "_position" | "_size" | "_isSelected" | "_color">(
			this,
			{
				_position: observable,
				position: computed,
				_size: observable,
				size: computed,
				_isSelected: observable,
				isSelected: computed,
				_color: observable,
				color: computed,
				normalize: action,
			},
			{
				autoBind: true,
			},
		);
	}

	get position() {
		return this._position;
	}

	set position(position) {
		this._position = position;
	}

	get size() {
		return this._size;
	}

	set size(value) {
		this._size = value;
	}

	get isSelected() {
		return this._isSelected;
	}

	set isSelected(value) {
		this._isSelected = value;
	}

	get color() {
		return this._color;
	}

	set color(value) {
		this._color = value;
	}

	normalize() {
		if (!this.position || !this.size) return;

		if (this.size.width < 0) {
			this.position.x += this.size.width;
			this.size.width = -this.size.width;
		}

		if (this.size.height < 0) {
			this.position.y += this.size.height;
			this.size.height = -this.size.height;
		}
	}
}
