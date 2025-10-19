import { action, computed, observable } from "mobx";

import type { Position, Size } from "@/shared/types/types";

export abstract class Entity {
	static readonly type: string = "entity";
	@observable private accessor _position: Position | null = null;
	@observable private accessor _size: Size | null = null;
	@observable private accessor _color: string = "#fff";
	@observable private accessor _borderWidth = 10;

	@computed get position() {
		return this._position;
	}

	@action set position(position) {
		this._position = position;
	}

	@computed get size() {
		return this._size;
	}

	@action set size(value) {
		this._size = value;
	}

	@computed get hasSize() {
		return !!this.size && this.size.width !== 0 && this.size.height !== 0;
	}

	@computed get color() {
		return this._color;
	}

	@action set color(value) {
		this._color = value;
	}

	@computed get borderWidth() {
		return this._borderWidth;
	}

	@action set borderWidth(value: number) {
		this._borderWidth = value;
	}

	@action normalize() {
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
