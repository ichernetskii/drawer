import { makeAutoObservable } from "mobx";

import { SelectionPreview } from "@/domain/entities/selection/selectionPreview/SelectionPreview.ts";
import { createGrid } from "@/infrastructure/factories/EntityFactory";
import type { SceneRepository } from "@/infrastructure/persistence/SceneRepository";
import type { Position, Size, Storable } from "@/shared/types/types";
import { debounce } from "@/shared/utils/debounce.ts";
import { snapToGrid } from "@/shared/utils/snap.ts";

export class SceneStore implements Storable {
	private repository: SceneRepository;
	private readonly zoomMin = 1 / 5;
	private readonly zoomMax = 5;
	readonly zoomFactor = 1.2;
	private readonly wheelFineDeltaThreshold = 50;
	private readonly wheelSensitivityFine = 0.01;
	private readonly wheelSensitivityCoarse = 0.001;
	readonly gridStep = 10; // Grid step in scene coordinates
	readonly gridStepShiftMultiplier = 10;

	private _size: Size = { width: 0, height: 0 };
	private _zoom = 1;
	private _origin: Position = { x: 0, y: 0 };
	private _mouseDown: Position | null = null;
	private _tool: string = SelectionPreview.type;
	private _isGridVisible = true;

	constructor(repository: SceneRepository) {
		this.repository = repository;
		makeAutoObservable(this);
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

	get grid() {
		const grid = createGrid();
		grid.setGridStep(this.gridStep);
		grid.setZoom(this.zoom);
		grid.setTopLeft(this.getSceneCoordinates({ x: 0, y: 0 }));
		grid.setBottomRight(this.getSceneCoordinates({ x: this.size.width, y: this.size.height }));
		grid.setPosition(null);
		grid.setSize(null);
		grid.setBorderWidth(10);
		return grid;
	}

	toggleGrid() {
		this._isGridVisible = !this._isGridVisible;
	}

	get isGridVisible() {
		return this._isGridVisible;
	}

	moveOriginBy(delta: Position) {
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
		this.repository.save({
			zoom: this.zoom,
			origin: this.origin,
			tool: this.tool,
		});
	}, 1000);

	load = () => {
		const data = this.repository.load();
		if (!data) return;

		this.zoom = data.zoom;
		this.origin = data.origin;
		this.tool = data.tool;
	};
}
