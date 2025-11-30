import { sceneToViewModel } from "@adapters";
import { type Scene } from "@domain";
import { AbstractRenderer } from "@infrastructure/ui/renderers/AbstractRenderer.ts";

export class SceneRenderer extends AbstractRenderer {
	private scene: Scene;

	constructor(ctx: CanvasRenderingContext2D, scene: Scene) {
		super(ctx);
		this.scene = scene;
	}

	render() {
		const sceneViewModel = sceneToViewModel(this.scene);
		const {
			size: { width, height },
			origin,
		} = sceneViewModel;

		const clientOrigin = this.scene.toClientPosition(origin);

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
