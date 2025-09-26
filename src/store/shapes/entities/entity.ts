import { computed, makeObservable, observable } from "mobx";

interface Position {
	x: number;
	y: number;
}

interface Size {
	width: number;
	height: number;
}

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

	constructor(type: EntityType) {
		this.id = getId();
		this.type = type;
		makeObservable<this, "_position" | "_size">(this, {
			position: computed,
			size: computed,
			_position: observable,
			_size: observable,
		});
	}

	get position() {
		return this._position;
	}

	set position(value: Position | null) {
		this._position = value;
	}

	get size() {
		return this._size;
	}

	set size(value: Size | null) {
		this._size = value;
	}
}
