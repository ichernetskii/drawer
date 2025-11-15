import { type Entity } from "@domain/entities/Entity.ts";
import { type Position } from "@domain/value-objects/Position.ts";

export interface IEntityRepository {
	// Queries
	findById(id: number): Entity | null;
	findAtPosition(position: Position): Entity | null;
	getAll(): Entity[];
	getDrawingEntity(): Entity | null;

	// Commands
	add(entity: Entity): void;
	remove(id: number): void;
	clear(): void;
	setDrawingEntity(drawingEntity: Entity | null): void;
}
