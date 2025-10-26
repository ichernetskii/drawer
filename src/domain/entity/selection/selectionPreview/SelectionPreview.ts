import type { Entity } from "@/domain/entity/Entity.ts";
import { Selection } from "@/domain/entity/selection/Selection.ts";

export class SelectionPreview extends Selection {
	static readonly type = "selectionPreview";

	constructor() {
		super();
		this.setColor("rgb(22,115,2)");
	}
}

export function isSelectionPreview(entity: Entity): entity is SelectionPreview {
	return entity instanceof SelectionPreview;
}
