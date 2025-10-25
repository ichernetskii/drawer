import type { Entity } from "@/domain/entities/Entity.ts";
import { Selection } from "@/domain/entities/selection/Selection.ts";

export interface HandleConfig {
	size: number; // handle size in scene units
	borderColor: string;
	fillColor: string;
	borderWidth: number; // handle border width in scene units
}

export class SelectionBox extends Selection {
	static readonly type = "selectionBox";

	protected _padding = 10;
	protected _zoom = 1; // needed for handle scaling

	// Handle configuration (corner squares)
	static readonly handleConfig: HandleConfig = {
		size: 8,
		borderColor: "rgb(255,255,255)",
		fillColor: "rgb(64,255,0)",
		borderWidth: 1,
	};

	constructor() {
		super();
		this.setColor("rgb(15,207,255)");
	}

	get padding(): number {
		return this._padding;
	}

	get zoom(): number {
		return this._zoom;
	}

	// Mutation methods
	setPadding(value: number) {
		this._padding = value;
	}

	setZoom(value: number) {
		this._zoom = value;
	}
}

export function isSelectionBox(entity: Entity): entity is SelectionBox {
	return entity instanceof SelectionBox;
}
