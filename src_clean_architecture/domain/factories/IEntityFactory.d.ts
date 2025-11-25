import { type Entity } from "@domain/entities/Entity.ts";

export type IEntityFactory = (type: string, position: Position) => Entity;
