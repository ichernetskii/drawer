import { Entity } from "@/store/entity/entity.ts";

export abstract class Selection extends Entity {
	static readonly type: string = "selection";

	constructor() {
		super();
		this.borderWidth = 5;
	}
}

export function isSelection(entity: Entity): entity is Selection {
	return entity instanceof Selection;
}
