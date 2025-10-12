import type { Entity } from "@/store/entity/entity.ts";
import { Selection } from "@/store/entity/selection/selection.ts";

export interface HandleConfig {
	size: number; // handle size in scene units
	borderColor: string;
	fillColor: string;
	borderWidth: number; // handle border width in scene units
}

export class SelectionBox extends Selection {
	static readonly type = "selectionBox";
	private _padding = 10;
	private _zoom = 1; // needed for handle scaling

	// Handle configuration (corner squares)
	readonly handleConfig: HandleConfig = {
		size: 8,
		borderColor: "rgb(255,255,255)",
		fillColor: "rgb(64,255,0)",
		borderWidth: 1,
	};

	constructor() {
		super();
		this.color = "rgb(15,207,255)";
	}

	get padding() {
		return this._padding;
	}

	set padding(value) {
		this._padding = value;
	}

	get zoom() {
		return this._zoom;
	}

	set zoom(value) {
		this._zoom = value;
	}
}

export function isSelectionBox(entity: Entity): entity is SelectionBox {
	return entity instanceof SelectionBox;
}
