import type { Ellipse } from "@domain/entities/Ellipse.ts";
import { type Entity } from "@domain/entities/Entity.ts";
import type { Rectangle } from "@domain/entities/Rectangle.ts";
import type { Text } from "@domain/entities/Text.ts";
import { SceneSize } from "@domain/value-objects/Size.ts";

export type Tool = typeof Rectangle.type | typeof Ellipse.type | typeof Text.type;

export interface IEntityRepository {
	// Queries
	readonly entities: Entity[];
	readonly drawingEntity: Entity | null;
	readonly tool: Tool;

	// Commands
	addEntity(entity: Entity): void;
	removeEntity(id: string): void;
	clearEntities(): void;
	setEntitySize(id: string, size: SceneSize): void;
	setDrawingEntity(drawingEntity: Entity | null): void;
	setTool(tool: Tool): void;
}
