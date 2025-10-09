import type { Entity } from "@/store/entity/entity.ts";
import { Selection } from "@/store/entity/selection/selection.ts";

export class SelectionPreview extends Selection {
	static readonly type = "selectionPreview";

	constructor() {
		super();
		this.color = "rgb(22,115,2)";
	}
}

export function isSelectionPreview(entity: Entity): entity is SelectionPreview {
	return entity instanceof SelectionPreview;
}
