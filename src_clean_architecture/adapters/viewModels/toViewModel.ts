import type { ISceneRepository } from "@adapters/repositories/ISceneRepository";
import { CoordinateTransformService } from "@adapters/services/CoordinateTransformService.ts";
import { type Entity, Rectangle, Text } from "@domain";

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

export function isRectangleViewModel(viewModel: IEntityViewModel): viewModel is IRectangleViewModel {
	return viewModel.type === Rectangle.type;
}

export function isTextViewModel(viewModel: IEntityViewModel): viewModel is ITextViewModel {
	return viewModel.type === Text.type;
}

export interface ITextViewModel extends IEntityViewModel {
	type: typeof Text.type;
	readonly text: string;
	readonly font: string;
}

const toEntityViewModel = (entity: Entity, sceneRepository: ISceneRepository): IEntityViewModel => {
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

const toRectangleViewModel = (rectangle: Rectangle, sceneRepository: ISceneRepository): IRectangleViewModel => {
	return {
		...toEntityViewModel(rectangle, sceneRepository),
		type: Rectangle.type,
	};
};

const toTextViewModel = (text: Text, sceneRepository: ISceneRepository): ITextViewModel => {
	return {
		...toEntityViewModel(text, sceneRepository),
		type: Text.type,
		text: text.text,
		font: text.style.font.toString(),
	};
};

export const toViewModel = (entity: Entity, sceneRepository: ISceneRepository) => {
	if (Rectangle.satisfies(entity)) {
		return toRectangleViewModel(entity, sceneRepository);
	}
	if (Text.satisfies(entity)) {
		return toTextViewModel(entity, sceneRepository);
	}
	throw new Error(`Unknown entity type: ${entity.getType()}`);
};
