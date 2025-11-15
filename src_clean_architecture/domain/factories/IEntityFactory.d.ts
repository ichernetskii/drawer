import { type Entity } from "@domain/entities/Entity.ts";

export interface IEntityFactory {
	createEntity(type: string, position: Position): Entity;
}
