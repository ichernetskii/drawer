import type { ISceneRepository } from "@adapters/repositories/ISceneRepository";
import { CoordinateTransformService } from "@adapters/services/CoordinateTransformService.ts";
import { Ellipse, type Entity, Rectangle, Text } from "@domain";

export interface IEntityViewModel {
	readonly type: string;
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
	readonly fillStyle: string;
	readonly strokeStyle: string;
	readonly lineWidth: number;
}

export interface IRectangleViewModel extends IEntityViewModel {
	type: typeof Rectangle.type;
}

export interface IEllipseViewModel extends IEntityViewModel {
	type: typeof Ellipse.type;
}

export interface ITextViewModel extends IEntityViewModel {
	type: typeof Text.type;
	readonly text: string;
	readonly font: string;
}

export function isRectangleViewModel(viewModel: IEntityViewModel): viewModel is IRectangleViewModel {
	return viewModel.type === Rectangle.type;
}

export function isEllipseViewModel(viewModel: IEntityViewModel): viewModel is IEllipseViewModel {
	return viewModel.type === Ellipse.type;
}

export function isTextViewModel(viewModel: IEntityViewModel): viewModel is ITextViewModel {
	return viewModel.type === Text.type;
}

const entityBaseToViewModel = (entity: Entity, sceneRepository: ISceneRepository): IEntityViewModel => {
	const position = CoordinateTransformService.scenePositionToClient(entity.position, sceneRepository);
	const size = CoordinateTransformService.sceneSizeToClient(entity.size, sceneRepository);

	return {
		type: entity.getType(),
		x: position.x,
		y: position.y,
		width: size.width,
		height: size.height,
		fillStyle: entity.style.fill.color.toString(),
		strokeStyle: entity.style.border.color.toString(),
		lineWidth: entity.style.border.width,
	};
};

const rectangleToViewModel = (rectangle: Rectangle, sceneRepository: ISceneRepository): IRectangleViewModel => {
	return {
		...entityBaseToViewModel(rectangle, sceneRepository),
		type: Rectangle.type,
	};
};

const ellipseToViewModel = (ellipse: Ellipse, sceneRepository: ISceneRepository): IEllipseViewModel => {
	return {
		...entityBaseToViewModel(ellipse, sceneRepository),
		type: Ellipse.type,
	};
};

const textToViewModel = (text: Text, sceneRepository: ISceneRepository): ITextViewModel => {
	return {
		...entityBaseToViewModel(text, sceneRepository),
		type: Text.type,
		text: text.text,
		font: text.style.font.toString(),
	};
};

export const entityToViewModel = (entity: Entity, sceneRepository: ISceneRepository) => {
	if (Rectangle.satisfies(entity)) {
		return rectangleToViewModel(entity, sceneRepository);
	}
	if (Ellipse.satisfies(entity)) {
		return ellipseToViewModel(entity, sceneRepository);
	}
	if (Text.satisfies(entity)) {
		return textToViewModel(entity, sceneRepository);
	}
	throw new Error(`Unknown entity type: ${entity.getType()}`);
};
