import { type Entity } from "@domain/entities/Entity.ts";
import { Size } from "@domain/value-objects/Size.ts";

export interface IEntityRepository {
	// Queries
	getAll(): Entity[];
	readonly drawingEntity: Entity | null;

	// Commands
	add(entity: Entity): void;
	remove(id: string): void;
	clear(): void;
	setSize(entity: Entity, size: Size);
	setDrawingEntity(drawingEntity: Entity | null): void;
}
