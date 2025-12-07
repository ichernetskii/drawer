import { AbstractRenderer } from "./AbstractRenderer.ts";
import type { EntitiesRenderer } from "./entities/EntitiesRenderer.ts";
import type { SceneRenderer } from "./scene/SceneRenderer.ts";

export class Renderer extends AbstractRenderer {
	private entitiesRenderer: EntitiesRenderer;
	private sceneRenderer: SceneRenderer;

	constructor(ctx: CanvasRenderingContext2D, entitiesRenderer: EntitiesRenderer, sceneRenderer: SceneRenderer) {
		super(ctx);
		this.entitiesRenderer = entitiesRenderer;
		this.sceneRenderer = sceneRenderer;
	}

	render() {
		const { clientWidth, clientHeight } = this.ctx.canvas;
		// clear canvas
		this.ctx.clearRect(0, 0, clientWidth, clientHeight);

		this.sceneRenderer.render();
		this.entitiesRenderer.render();
	}
}
