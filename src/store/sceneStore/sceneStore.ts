import { action, computed, observable } from "mobx";

import type { Position, Size, Storable } from "@/shared/types/types";
import { debounce } from "@/shared/utils/debounce.ts";
import { snapToGrid } from "@/shared/utils/snap.ts";
import { Storage } from "@/shared/utils/storage.ts";
import { Grid } from "@/store/entity/grid/grid.ts";
import { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";

interface StoredSceneStore {
	zoom: number;
	origin: Position;
	tool: string;
}

export class SceneStore implements Storable {
	private readonly zoomMin = 1 / 5;
	private readonly zoomMax = 5;
	readonly zoomFactor = 1.2;
	private readonly wheelFineDeltaThreshold = 50;
	private readonly wheelSensitivityFine = 0.01;
	private readonly wheelSensitivityCoarse = 0.001;
	readonly gridStep = 10; // Grid step in scene coordinates
	readonly gridStepShiftMultiplier = 10;

	private storage = new Storage<StoredSceneStore>("sceneStore");

	@observable private accessor _size: Size = { width: 0, height: 0 };
	@observable private accessor _zoom = 1;
	@observable private accessor _origin: Position = { x: 0, y: 0 };
	@observable private accessor _mouseDown: Position | null = null;
	@observable private accessor _tool: string = SelectionPreview.type;
	@observable private accessor _isGridVisible = true;

	@computed get size() {
		return this._size;
	}

	@action set size(value) {
		this._size = value;
	}

	@computed get zoom() {
		return this._zoom;
	}

	@action set zoom(value) {
		this._zoom = value > this.zoomMax ? this.zoomMax : value < this.zoomMin ? this.zoomMin : value;
	}

	getWheelZoomFactor({ deltaMode, deltaY }: { deltaMode: number; deltaY: number }) {
		// Heuristic: increase sensitivity for touchpad-like fine-grained deltas
		const isPixel = deltaMode === WheelEvent.DOM_DELTA_PIXEL; // delta values in pixels
		const isFine = isPixel && Math.abs(deltaY) < this.wheelFineDeltaThreshold;
		const zoomSensitivity = isFine ? this.wheelSensitivityFine : this.wheelSensitivityCoarse;
		return Math.exp(-deltaY * zoomSensitivity);
	}

	@computed get origin() {
		return this._origin;
	}

	@action set origin(value) {
		this._origin = value;
	}

	@computed get mouseDown() {
		return this._mouseDown;
	}

	@action set mouseDown(value) {
		this._mouseDown = value;
	}

	@computed get tool() {
		return this._tool;
	}

	@action set tool(value) {
		this._tool = value;
	}

	@computed get grid() {
		const grid = new Grid();
		grid.gridStep = this.gridStep;
		grid.zoom = this.zoom;
		grid.topLeft = this.getSceneCoordinates({ x: 0, y: 0 });
		grid.bottomRight = this.getSceneCoordinates({ x: this.size.width, y: this.size.height });
		return grid;
	}

	@action toggleGrid() {
		this._isGridVisible = !this._isGridVisible;
	}

	@computed get isGridVisible() {
		return this._isGridVisible;
	}

	@action moveOriginBy(delta: Position) {
		this.origin = { x: this.origin.x + delta.x, y: this.origin.y + delta.y };
	}

	@action zoomAtSceneCoordinates(sceneCoordinated: Position, factor: number) {
		const prevZoom = this.zoom;
		this.zoom = prevZoom * factor;
		const effectiveFactor = this.zoom / prevZoom;

		const newOriginX = sceneCoordinated.x - (sceneCoordinated.x - this.origin.x) / effectiveFactor;
		const newOriginY = sceneCoordinated.y - (sceneCoordinated.y - this.origin.y) / effectiveFactor;

		this.origin = { x: newOriginX, y: newOriginY };
	}

	getSceneCoordinates(clientCoordinates: Position, snap = false) {
		// Inverse of renderer transform: translate(center) -> scale(zoom, -zoom) -> translate(-origin)
		const centerX = clientCoordinates.x - this.size.width / 2;
		const centerY = clientCoordinates.y - this.size.height / 2;
		let sceneX = centerX / this.zoom + this.origin.x;
		let sceneY = -centerY / this.zoom + this.origin.y;

		if (snap) {
			sceneX = snapToGrid(sceneX, this.gridStep);
			sceneY = snapToGrid(sceneY, this.gridStep);
		}

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
