import type { IClonable } from "@domain/interfaces/IClonable.d.ts";
import { generateUUID } from "@domain/kernel/generate-uuid.ts";
import { Color } from "@domain/value-objects/Color.ts";
import type { ScenePosition } from "@domain/value-objects/Position.ts";
import { SceneSize } from "@domain/value-objects/Size.ts";

export interface IEntityStyle {
	border: {
		width: number;
		color: Color;
	};
	fill: {
		color: Color;
	};
}

export abstract class Entity implements IClonable {
	static readonly type: string; // abstract, will be overridden by subclasses
	getType<T extends typeof Entity>(this: InstanceType<T>): T["type"] {
		// T, typeof Entity - constructor
		// InstanceType<T> - class
		return (this.constructor as T).type;
	}

	id: string;
	position: ScenePosition;
	size: SceneSize = new SceneSize();
	style: IEntityStyle = {
		border: {
			width: 1,
			color: Color.White,
		},
		fill: {
			color: Color.Transparent,
		},
	};

	constructor(position: ScenePosition) {
		this.position = position;
		this.id = generateUUID();
	}

	static satisfies<T extends typeof Entity>(this: T, entity: Entity): entity is InstanceType<T> {
		// T, typeof Entity - constructor
		// InstanceType<T> - class
		return this.type === entity.getType();
	}

	isPointInside(point: ScenePosition): boolean {
		return (
			point.x >= this.position.x &&
			point.x <= this.position.x + this.size.width &&
			point.y >= this.position.y &&
			point.y <= this.position.y + this.size.height
		);
	}

	clone() {
		const Constructor = this.constructor as new (...args: ConstructorParameters<typeof Entity>) => this;
		const clone = new Constructor(this.position.clone());
		clone.size = this.size.clone();
		clone.style = {
			border: {
				width: this.style.border.width,
				color: this.style.border.color.clone(),
			},
			fill: {
				color: this.style.fill.color.clone(),
			},
		};
		return clone;
	}
}
