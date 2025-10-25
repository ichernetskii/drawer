import { Entity } from "@/domain/entities/Entity.ts";

export abstract class Selection extends Entity {
	static readonly type: string = "selection";

	constructor() {
		super();
		this.setBorderWidth(5);
	}
}

export function isSelection(entity: Entity): entity is Selection {
	return entity instanceof Selection;
}
