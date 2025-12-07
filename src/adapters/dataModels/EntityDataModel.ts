import { entityFactory } from "@adapters";
import { Color, Ellipse, Entity, Font, Rectangle, ScenePosition, SceneSize, Text } from "@domain";

import type { ToPlainObject } from "./ToPlainObject.d.ts";

export type IEntityDataModel = ToPlainObject<Entity> & {
	type: string;
};

type IRectangleDataModel = ToPlainObject<Rectangle> & {
	type: typeof Rectangle.type;
};

type IEllipseDataModel = ToPlainObject<Ellipse> & {
	type: typeof Ellipse.type;
};

type ITextDataModel = ToPlainObject<Text> & {
	type: typeof Text.type;
};

function entityBaseToDataModel(entity: Entity): IEntityDataModel {
	return {
		id: entity.id,
		type: entity.getType(),
		position: {
			x: entity.position.x,
			y: entity.position.y,
		},
		size: {
			width: entity.size.width,
			height: entity.size.height,
		},
		style: {
			border: {
				width: entity.style.border.width,
				color: {
					red: entity.style.border.color.red,
					green: entity.style.border.color.green,
					blue: entity.style.border.color.blue,
					alpha: entity.style.border.color.alpha,
				},
			},
			fill: {
				color: {
					red: entity.style.fill.color.red,
					green: entity.style.fill.color.green,
					blue: entity.style.fill.color.blue,
					alpha: entity.style.fill.color.alpha,
				},
			},
		},
	};
}

function rectangleToDataModel(rectangle: Rectangle): IRectangleDataModel {
	return {
		...entityBaseToDataModel(rectangle),
		type: Rectangle.type,
	};
}

function textToDataModel(text: Text): ITextDataModel {
	return {
		...entityBaseToDataModel(text),
		type: Text.type,
		text: text.text,
		style: {
			...entityBaseToDataModel(text).style,
			font: {
				size: text.style.font.size,
				family: text.style.font.family,
			},
		},
	};
}

function ellipseToDataModel(ellipse: Ellipse): IEllipseDataModel {
	return {
		...entityBaseToDataModel(ellipse),
		type: Ellipse.type,
	};
}

export function isRectangleDataModel(dataModel: IEntityDataModel): dataModel is IRectangleDataModel {
	return dataModel.type === Rectangle.type;
}

export function isEllipseDataModel(dataModel: IEntityDataModel): dataModel is IEllipseDataModel {
	return dataModel.type === Ellipse.type;
}

export function isTextDataModel(dataModel: IEntityDataModel): dataModel is ITextDataModel {
	return dataModel.type === Text.type;
}

export function entityToDataModel(entity: Entity): IEntityDataModel {
	if (Rectangle.satisfies(entity)) {
		return rectangleToDataModel(entity);
	}
	if (Text.satisfies(entity)) {
		return textToDataModel(entity);
	}
	if (Ellipse.satisfies(entity)) {
		return ellipseToDataModel(entity);
	}
	throw new Error(`Unknown entity type: ${entity.getType()}`);
}

export function dataModelToEntity(dataModel: IEntityDataModel) {
	const position = new ScenePosition(dataModel.position.x, dataModel.position.y);

	const entity = entityFactory(dataModel.type, position);

	entity.size = new SceneSize(dataModel.size.width, dataModel.size.height);

	entity.style = {
		border: {
			width: dataModel.style.border.width,
			color: new Color(
				dataModel.style.border.color.red,
				dataModel.style.border.color.green,
				dataModel.style.border.color.blue,
				dataModel.style.border.color.alpha,
			),
		},
		fill: {
			color: new Color(
				dataModel.style.fill.color.red,
				dataModel.style.fill.color.green,
				dataModel.style.fill.color.blue,
				dataModel.style.fill.color.alpha,
			),
		},
	};

	if (isTextDataModel(dataModel) && Text.satisfies(entity)) {
		entity.text = dataModel.text;
		entity.style.font = new Font(dataModel.style.font.size, dataModel.style.font.family);
	}

	return entity;
}
