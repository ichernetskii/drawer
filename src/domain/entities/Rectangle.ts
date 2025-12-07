import { Entity } from "@domain/entities/Entity.ts";

export class Rectangle extends Entity {
	static override readonly type = "rectangle" as const;
	declare getType: () => typeof Rectangle.type;
}
