import { Entity } from "@/domain/entities/Entity.ts";
import type { Position } from "@/shared/types/types";

export class Grid extends Entity {
	static readonly type = "grid";

	protected _gridStep: number = 10;
	protected _zoom: number = 1;
	protected _topLeft: Position = { x: 0, y: 0 };
	protected _bottomRight: Position = { x: 0, y: 0 };

	constructor() {
		super();
		this.setColor("rgba(255, 255, 255, 0.1)");
	}

	get gridStep(): number {
		return this._gridStep;
	}

	get zoom(): number {
		return this._zoom;
	}

	get topLeft(): Position {
		return this._topLeft;
	}

	get bottomRight(): Position {
		return this._bottomRight;
	}

	// Mutation methods
	setGridStep(value: number) {
		this._gridStep = value;
	}

	setZoom(value: number) {
		this._zoom = value;
	}

	setTopLeft(value: Position) {
		this._topLeft = value;
	}

	setBottomRight(value: Position) {
		this._bottomRight = value;
	}
}

export function isGrid(entity: Entity): entity is Grid {
	return entity instanceof Grid;
}
