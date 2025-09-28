import { makeAutoObservable } from "mobx";

import type { Position, Size } from "@/types/types";

export class SceneStore {
	private _size: Size = { width: 0, height: 0 };
	private _zoom = 1;
	private _origin: Position = { x: 0, y: 0 };

	constructor() {
		makeAutoObservable(
			this,
			{},
			{
				autoBind: true,
			},
		);
	}

	get size(): Size {
		return this._size;
	}

	setSize(size: Size) {
		this._size = size;
	}

	get zoom(): number {
		return this._zoom;
	}

	setZoom(zoom: number) {
		this._zoom = Math.max(1 / 5, Math.min(zoom, 5));
	}

	get origin() {
		return this._origin;
	}

	setOrigin(origin: Position) {
		this._origin = origin;
	}

	panBy(delta: Position) {
		this._origin = { x: this._origin.x + delta.x, y: this._origin.y + delta.y };
	}

	getSceneCoordinates(mouseCoordinates: Position) {
		// Inverse of renderer transform: translate(center) -> scale(zoom, -zoom) -> translate(-origin)
		const cx = mouseCoordinates.x - this.size.width / 2;
		const cy = mouseCoordinates.y - this.size.height / 2;
		const wx = cx / this._zoom + this.origin.x;
		const wy = -cy / this._zoom + this.origin.y;
		return { x: wx, y: wy };
	}
}
