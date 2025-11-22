import { Ellipse, Entity, type IEntityFactory, Position, Rectangle, Text } from "@domain";

export class EntityFactory implements IEntityFactory {
	createEntity(type: string, position: Position): Entity {
		switch (type) {
			case Rectangle.type:
				return new Rectangle(position);
			case Ellipse.type:
				return new Ellipse(position);
			case Text.type:
				return new Text(position);
			default:
				throw new Error("Unknown Entity");
		}
	}
}
