import type { Entity } from "@/store/entity/entity.ts";
import { Selection } from "@/store/entity/selection/selection.ts";

export class SelectionBox extends Selection {
	static readonly type = "selectionBox";
	readonly padding = 10;

	constructor() {
		super();
		this.color = "rgb(64,255,0)";
	}
}

export function isSelectionBox(entity: Entity): entity is SelectionBox {
	return entity instanceof SelectionBox;
}
