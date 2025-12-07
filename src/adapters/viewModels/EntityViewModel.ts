import { Ellipse, type Entity, Rectangle, Scene, Text } from "@domain";

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

const entityBaseToViewModel = (entity: Entity, scene: Scene): IEntityViewModel => {
	const position = scene.toClientPosition(entity.position);
	const size = scene.toClientSize(entity.size);

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

const rectangleToViewModel = (rectangle: Rectangle, scene: Scene): IRectangleViewModel => {
	return {
		...entityBaseToViewModel(rectangle, scene),
		type: Rectangle.type,
	};
};

const ellipseToViewModel = (ellipse: Ellipse, scene: Scene): IEllipseViewModel => {
	return {
		...entityBaseToViewModel(ellipse, scene),
		type: Ellipse.type,
	};
};

const textToViewModel = (text: Text, scene: Scene): ITextViewModel => {
	return {
		...entityBaseToViewModel(text, scene),
		type: Text.type,
		text: text.text,
		font: text.style.font.toString(),
	};
};

export const entityToViewModel = (entity: Entity, scene: Scene) => {
	if (Rectangle.satisfies(entity)) {
		return rectangleToViewModel(entity, scene);
	}
	if (Ellipse.satisfies(entity)) {
		return ellipseToViewModel(entity, scene);
	}
	if (Text.satisfies(entity)) {
		return textToViewModel(entity, scene);
	}
	throw new Error(`Unknown entity type: ${entity.getType()}`);
};
