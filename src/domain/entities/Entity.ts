import type { Position, Size } from "@/shared/types/types.d.ts";

export abstract class Entity {
	static readonly type: string = "entity";

	protected _position: Position | null = null;
	protected _size: Size | null = null;
	protected _color: string = "#fff";
	protected _borderWidth = 10;

	get type(): string {
		return (this.constructor as typeof Entity).type;
	}

	get position(): Position | null {
		return this._position;
	}

	get size(): Size | null {
		return this._size;
	}

	get color(): string {
		return this._color;
	}

	get borderWidth(): number {
		return this._borderWidth;
	}

	get hasSize() {
		return !!this._size && this._size.width !== 0 && this._size.height !== 0;
	}

	// Mutation methods
	setPosition(value: Position | null) {
		this._position = value;
	}

	setSize(value: Size | null) {
		this._size = value;
	}

	setColor(value: string) {
		this._color = value;
	}

	setBorderWidth(value: number) {
		this._borderWidth = value;
	}

	moveBy(deltaX: number, deltaY: number) {
		if (this._position) {
			this._position = {
				x: this._position.x + deltaX,
				y: this._position.y + deltaY,
			};
		}
	}

	normalize() {
		if (!this._position || !this._size) return;

		if (this._size.width < 0) {
			this._position.x += this._size.width;
			this._size.width = -this._size.width;
		}

		if (this._size.height < 0) {
			this._position.y += this._size.height;
			this._size.height = -this._size.height;
		}
	}
}
