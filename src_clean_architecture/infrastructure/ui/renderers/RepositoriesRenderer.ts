import type { IRenderer } from "./IRenderer.d.ts";

export class RepositoriesRenderer implements IRenderer {
	private ctx: CanvasRenderingContext2D;
	private entityRepositoryRenderer: IRenderer;
	private sceneRepositoryRenderer: IRenderer;

	constructor(
		ctx: CanvasRenderingContext2D,
		entityRepositoryRenderer: IRenderer,
		sceneRepositoryRenderer: IRenderer,
	) {
		this.ctx = ctx;
		this.entityRepositoryRenderer = entityRepositoryRenderer;
		this.sceneRepositoryRenderer = sceneRepositoryRenderer;
	}

	render() {
		const { clientWidth, clientHeight } = this.ctx.canvas;
		// clear canvas
		this.ctx.clearRect(0, 0, clientWidth, clientHeight);

		this.sceneRepositoryRenderer.render();
		this.entityRepositoryRenderer.render();
	}
}
