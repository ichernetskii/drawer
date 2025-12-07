import { Ellipse, type Entity, type IEntityFactory, Rectangle, type ScenePosition, Text } from "@domain";

export const entityFactory: IEntityFactory = (type: string, position: ScenePosition): Entity => {
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
};
