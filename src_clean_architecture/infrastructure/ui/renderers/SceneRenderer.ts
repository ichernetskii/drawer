import { toViewModel } from "@adapters";
import type { ISceneRepository } from "@adapters/repositories/ISceneRepository";
import type { IEntityRepository } from "@domain";
import { EntityRenderer } from "@infrastructure/ui/renderers/EntityRenderer.ts";

export class SceneRenderer {
	ctx: CanvasRenderingContext2D;
	entityRepository: IEntityRepository;
	entityRenderer: EntityRenderer;
	sceneRepository: ISceneRepository;

	constructor(ctx: CanvasRenderingContext2D, entityRepository: IEntityRepository, sceneRepository: ISceneRepository) {
		this.ctx = ctx;
		this.entityRepository = entityRepository;
		this.entityRenderer = new EntityRenderer(this.ctx);
		this.sceneRepository = sceneRepository;
	}

	render() {
		const { clientWidth, clientHeight } = this.ctx.canvas;
		this.ctx.clearRect(0, 0, clientWidth, clientHeight);

		this.entityRepository.getAll().forEach(entity => {
			this.entityRenderer.render(toViewModel(entity, this.sceneRepository));
		});

		const drawingEntity = this.entityRepository.drawingEntity;
		if (drawingEntity) {
			this.entityRenderer.render(toViewModel(drawingEntity, this.sceneRepository));
		}
	}
}
