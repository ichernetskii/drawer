import { makeAutoObservable, reaction } from "mobx";

import type { Position, Size, Storable } from "@/shared/types/types";
import { debounce } from "@/shared/utils/debounce.ts";
import { Storage } from "@/shared/utils/storage.ts";
import { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";

interface StoredSceneStore {
	zoom: number;
	origin: Position;
	tool: string;
}

export class SceneStore implements Storable {
	private readonly zoomMin = 1 / 5;
	private readonly zoomMax = 5;
	private readonly keyTranslateStep = 5;
	private readonly keyTranslateShiftMultiplier = 10;
	readonly zoomFactor = 1.2;
	private readonly wheelFineDeltaThreshold = 50;
	private readonly wheelSensitivityFine = 0.01;
	private readonly wheelSensitivityCoarse = 0.001;

	private _size: Size = { width: 0, height: 0 };
	private _zoom = 1;
	private _origin: Position = { x: 0, y: 0 };
	private _mouseDown: Position | null = null;
	private _tool: string = SelectionPreview.type;
	private storage = new Storage<StoredSceneStore>("sceneStore");

	constructor() {
		makeAutoObservable(
			this,
			{},
			{
				autoBind: true,
			},
		);

		reaction(
			() => [this.zoom, this.origin, this.tool],
			() => this.save(),
		);
	}

	get size() {
		return this._size;
	}

	set size(value) {
		this._size = value;
	}

	get zoom() {
		return this._zoom;
	}

	set zoom(value) {
		this._zoom = value > this.zoomMax ? this.zoomMax : value < this.zoomMin ? this.zoomMin : value;
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

	set origin(value) {
		this._origin = value;
	}

	get mouseDown() {
		return this._mouseDown;
	}

	set mouseDown(value) {
		this._mouseDown = value;
	}

	get tool() {
		return this._tool;
	}

	set tool(value) {
		this._tool = value;
	}

	getKeyTranslateStep({ shiftKey }: { shiftKey: boolean }) {
		return this.keyTranslateStep * (shiftKey ? this.keyTranslateShiftMultiplier : 1);
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

	save = debounce(() => {
		this.storage.save({
			zoom: this.zoom,
			origin: this.origin,
			tool: this.tool,
		});
	}, 1000);

	load = () => {
		const data = this.storage.load();
		if (!data) return;

		this.zoom = data.zoom;
		this.origin = data.origin;
		this.tool = data.tool;
	};
}
