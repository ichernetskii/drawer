import { makeAutoObservable } from "mobx";

import type { Position, Size } from "@/types/types";

export class SceneStore {
	private _size: Size = { width: 0, height: 0 };
	private _zoom = 1;
	private _origin: Position = { x: 0, y: 0 };

	private readonly zoomMin = 1 / 5;
	private readonly zoomMax = 5;
	private readonly keyTranslateStep = 5;
	private readonly keyTranslateShiftMultiplier = 10;
	readonly zoomFactor = 1.2;
	private readonly wheelFineDeltaThreshold = 50;
	private readonly wheelSensitivityFine = 0.01;
	private readonly wheelSensitivityCoarse = 0.001;

	constructor() {
		makeAutoObservable(
			this,
			{},
			{
				autoBind: true,
			},
		);
	}

	get size() {
		return this._size;
	}

	set size(size) {
		this._size = size;
	}

	get zoom() {
		return this._zoom;
	}

	set zoom(zoom) {
		this._zoom = zoom > this.zoomMax ? this.zoomMax : zoom < this.zoomMin ? this.zoomMin : zoom;
	}

	getWheelZoomFactor({ deltaMode, deltaY }: { deltaMode: number; deltaY: number }) {
		// Heuristic: increase sensitivity for touchpad-like fine-grained deltas
		const isPixel = deltaMode === WheelEvent.DOM_DELTA_PIXEL; // delta values in pixels
		const isFine = isPixel && Math.abs(deltaY) < this.wheelFineDeltaThreshold;
		const zoomSensitivity = isFine ? this.wheelSensitivityFine : this.wheelSensitivityCoarse;
		return Math.exp(-deltaY * zoomSensitivity);
	}

	get origin() {
		return this._origin;
	}

	set origin(origin) {
		this._origin = origin;
	}

	getKeyTranslateStep({ shiftKey }: { shiftKey: boolean }) {
		return (this.keyTranslateStep * (shiftKey ? this.keyTranslateShiftMultiplier : 1)) / this.zoom;
	}

	translateOriginBy(delta: Position) {
		this.origin = { x: this.origin.x + delta.x, y: this.origin.y + delta.y };
	}

	zoomAtSceneCoordinates(sceneCoordinated: Position, factor: number) {
		const prevZoom = this.zoom;
		this.zoom = prevZoom * factor;
		const effectiveFactor = this.zoom / prevZoom;

		const newOriginX = sceneCoordinated.x - (sceneCoordinated.x - this.origin.x) / effectiveFactor;
		const newOriginY = sceneCoordinated.y - (sceneCoordinated.y - this.origin.y) / effectiveFactor;

		this.origin = { x: newOriginX, y: newOriginY };
	}

	getSceneCoordinates(clientCoordinates: Position) {
		// Inverse of renderer transform: translate(center) -> scale(zoom, -zoom) -> translate(-origin)
		const centerX = clientCoordinates.x - this.size.width / 2;
		const centerY = clientCoordinates.y - this.size.height / 2;
		const sceneX = centerX / this.zoom + this.origin.x;
		const sceneY = -centerY / this.zoom + this.origin.y;
		return { x: sceneX, y: sceneY };
	}
}
