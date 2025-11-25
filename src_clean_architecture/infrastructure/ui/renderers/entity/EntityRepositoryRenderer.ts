import {
	entityToViewModel,
	type ISceneRepository,
	isEllipseViewModel,
	isRectangleViewModel,
	isTextViewModel,
} from "@adapters";
import { type IEntityRepository } from "@domain";
import { EllipseRenderer } from "@infrastructure/ui/renderers/entity/EllipseRenderer.ts";
import { RectangleRenderer } from "@infrastructure/ui/renderers/entity/RectangleRenderer.ts";
import { TextRenderer } from "@infrastructure/ui/renderers/entity/TextRenderer.ts";
export class EntityRepositoryRenderer {
	ctx: CanvasRenderingContext2D;
	entityRepository: IEntityRepository;
	sceneRepository: ISceneRepository;
	rectangleRenderer: RectangleRenderer;
	ellipseRenderer: EllipseRenderer;
	textRenderer: TextRenderer;

	constructor(ctx: CanvasRenderingContext2D, entityRepository: IEntityRepository, sceneRepository: ISceneRepository) {
		this.ctx = ctx;
		this.entityRepository = entityRepository;
		this.sceneRepository = sceneRepository;
		this.rectangleRenderer = new RectangleRenderer(ctx);
		this.ellipseRenderer = new EllipseRenderer(ctx);
		this.textRenderer = new TextRenderer(ctx);
	}

	render() {
		const { clientWidth, clientHeight } = this.ctx.canvas;
		this.ctx.clearRect(0, 0, clientWidth, clientHeight);

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
