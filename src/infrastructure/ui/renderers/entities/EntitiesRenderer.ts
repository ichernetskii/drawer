import { entityToViewModel, isEllipseViewModel, isRectangleViewModel, isTextViewModel } from "@adapters";
import { type IEntityRepository, type Scene } from "@domain";
import { AbstractRenderer } from "@infrastructure/ui/renderers/AbstractRenderer.ts";

import { EllipseRenderer } from "./entity/EllipseRenderer.ts";
import { RectangleRenderer } from "./entity/RectangleRenderer.ts";
import { TextRenderer } from "./entity/TextRenderer.ts";
export class EntitiesRenderer extends AbstractRenderer {
	private entityRepository: IEntityRepository;
	private scene: Scene;
	private rectangleRenderer: RectangleRenderer;
	private ellipseRenderer: EllipseRenderer;
	private textRenderer: TextRenderer;

	constructor(ctx: CanvasRenderingContext2D, entityRepository: IEntityRepository, scene: Scene) {
		super(ctx);
		this.entityRepository = entityRepository;
		this.scene = scene;
		this.rectangleRenderer = new RectangleRenderer(ctx);
		this.ellipseRenderer = new EllipseRenderer(ctx);
		this.textRenderer = new TextRenderer(ctx);
	}

	render() {
		const viewModels = [...this.entityRepository.entities, this.entityRepository.drawingEntity]
			.filter(entity => !!entity)
			.map(entity => entityToViewModel(entity, this.scene));

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
