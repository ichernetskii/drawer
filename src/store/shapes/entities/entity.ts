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
				setPosition: action,
				_size: observable,
				size: computed,
				setSize: action,
				_isSelected: observable,
				isSelected: computed,
				setIsSelected: action,
				_color: observable,
				color: computed,
				setColor: action,
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

	setPosition(position: Position) {
		this._position = position;
	}

	get size() {
		return this._size;
	}

	setSize(value: Size | null) {
		this._size = value;
	}

	get isSelected() {
		return this._isSelected;
	}

	setIsSelected(value: boolean) {
		this._isSelected = value;
	}

	get color() {
		return this._color;
	}

	setColor(value: string) {
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
