import type { Position } from "@/shared/types/types";
import { Entity } from "@/store/entity/entity.ts";

export class Grid extends Entity {
	static readonly type = "grid";
	gridStep: number = 10;
	zoom: number = 1;
	topLeft: Position = { x: 0, y: 0 };
	bottomRight: Position = { x: 0, y: 0 };

	constructor() {
		super();
		this._color = "rgba(255, 255, 255, 0.1)";
	}
}

export function isGrid(entity: Entity): entity is Grid {
	return entity instanceof Grid;
}
