import {
	entityToViewModel,
	type ISceneRepository,
	isEllipseViewModel,
	isRectangleViewModel,
	isTextViewModel,
} from "@adapters";
import { type IEntityRepository } from "@domain";
import type { IRenderer } from "@infrastructure/ui/renderers/IRenderer.d.ts";

import { EllipseRenderer } from "./entity/EllipseRenderer.ts";
import { RectangleRenderer } from "./entity/RectangleRenderer.ts";
import { TextRenderer } from "./entity/TextRenderer.ts";
export class EntityRepositoryRenderer implements IRenderer {
	private entityRepository: IEntityRepository;
	private sceneRepository: ISceneRepository;
	private rectangleRenderer: RectangleRenderer;
	private ellipseRenderer: EllipseRenderer;
	private textRenderer: TextRenderer;

	constructor(ctx: CanvasRenderingContext2D, entityRepository: IEntityRepository, sceneRepository: ISceneRepository) {
		this.entityRepository = entityRepository;
		this.sceneRepository = sceneRepository;
		this.rectangleRenderer = new RectangleRenderer(ctx);
		this.ellipseRenderer = new EllipseRenderer(ctx);
		this.textRenderer = new TextRenderer(ctx);
	}

	render() {
		const viewModels = [...this.entityRepository.getAll(), this.entityRepository.drawingEntity]
			.filter(entity => !!entity)
			.map(entity => entityToViewModel(entity, this.sceneRepository));

		viewModels.forEach(viewModel => {
			if (isRectangleViewModel(viewModel)) {
				this.rectangleRenderer.render(viewModel);
			} else if (isEllipseViewModel(viewModel)) {
				this.ellipseRenderer.render(viewModel);
			} else if (isTextViewModel(viewModel)) {
				this.textRenderer.render(viewModel);
			}
		});
	}
}
