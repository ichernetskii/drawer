import { type Entity } from "@domain";

export class EntityViewModel {
	readonly type: string;
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
	readonly fillStyle: string;
	readonly strokeStyle: string;
	readonly lineWidth: number;

	constructor(entity: Entity) {
		this.type = entity.getType();
		this.x = entity.position.x;
		this.y = entity.position.y;
		this.width = entity.size.width;
		this.height = entity.size.height;
		this.fillStyle = entity.style.fill.color.toString();
		this.strokeStyle = entity.style.border.color.toString();
		this.lineWidth = entity.style.border.width;
	}
}
