import { action, computed, makeObservable, observable } from "mobx";

import type { Position, Size } from "@/types/types";

export abstract class Entity {
	static readonly type: string = "entity";
	protected _position: Position | null = null;
	protected _size: Size | null = null;
	protected _color: string = "#fff";
	protected _borderWidth = 10;

	constructor() {
		makeObservable<this, "_position" | "_size" | "_color" | "_borderWidth">(
			this,
			{
				_position: observable,
				position: computed,
				_size: observable,
				size: computed,
				_color: observable,
				color: computed,
				_borderWidth: observable,
				borderWidth: computed,
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

	get hasSize() {
		return !!this.size && this.size.width !== 0 && this.size.height !== 0;
	}

	get color() {
		return this._color;
	}

	set color(value) {
		this._color = value;
	}

	get borderWidth() {
		return this._borderWidth;
	}

	set borderWidth(value: number) {
		this._borderWidth = value;
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
