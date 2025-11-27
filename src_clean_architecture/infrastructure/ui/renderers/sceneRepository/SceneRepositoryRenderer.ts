import { type ISceneRepository } from "@adapters";
import { CoordinateTransformService } from "@adapters/services/CoordinateTransformService.ts";
import { Position } from "@domain";
import type { IRenderer } from "@infrastructure/ui/renderers/IRenderer.d.ts";

export class SceneRepositoryRenderer implements IRenderer {
	private ctx: CanvasRenderingContext2D;
	private sceneRepository: ISceneRepository;

	constructor(ctx: CanvasRenderingContext2D, sceneRepository: ISceneRepository) {
		this.ctx = ctx;
		this.sceneRepository = sceneRepository;
	}

	render() {
		const { width, height } = this.sceneRepository.size;

		const sceneOrigin = new Position(0, 0);
		const clientOrigin = CoordinateTransformService.scenePositionToClient(sceneOrigin, this.sceneRepository);

		this.ctx.save();
		this.ctx.strokeStyle = "#888888";
		this.ctx.lineWidth = 2;
		this.ctx.setLineDash([5, 5]);

		// Draw X axis (horizontal line through origin)
		this.ctx.beginPath();
		this.ctx.moveTo(0, clientOrigin.y);
		this.ctx.lineTo(width, clientOrigin.y);
		this.ctx.stroke();

		// Draw Y axis (vertical line through origin)
		this.ctx.beginPath();
		this.ctx.moveTo(clientOrigin.x, 0);
		this.ctx.lineTo(clientOrigin.x, height);
		this.ctx.stroke();

		this.ctx.restore();
	}
}
