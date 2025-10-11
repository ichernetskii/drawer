import { Entity } from "@/store/entity/entity.ts";

const getId = (() => {
	let counter = 0;
	return () => counter++;
})();

export abstract class Drawable extends Entity {
	static readonly type: string = "drawable";
	readonly id: number;

	constructor() {
		super();
		this.id = getId();
	}
}

export function isDrawable(entity: Entity): entity is Drawable {
	return entity instanceof Drawable;
}
