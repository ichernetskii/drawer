import { autorun } from "mobx";

import { EntityRenderer } from "@/renderer/entities/entity.ts";
import { Renderer } from "@/renderer/renderer.ts";
import type { RootStore } from "@/store/root.ts";

export class SceneRenderer extends Renderer {
	private readonly rootStore;
	private readonly entityRenderer;

	constructor(ctx: CanvasRenderingContext2D, rootStore: RootStore) {
		super(ctx);
		this.rootStore = rootStore;
		this.entityRenderer = new EntityRenderer(this.ctx);
	}

	private drawAxes() {
		const { clientWidth: width, clientHeight: height } = this.ctx.canvas;

		this.ctx.strokeStyle = "#333";
		this.ctx.lineWidth = 1;

		// X
		this.ctx.beginPath();
		this.ctx.moveTo(0, height / 2);
		this.ctx.lineTo(width, height / 2);

		// Y
		this.ctx.moveTo(width / 2, 0);
		this.ctx.lineTo(width / 2, height);
		this.ctx.stroke();
	}
	render() {
		const { clientWidth: width, clientHeight: height } = this.ctx.canvas;

		autorun(() => {
			const { drawingEntity, getEntities } = this.rootStore.shapesStore;

			// clear canvas
			this.ctx.clearRect(0, 0, width, height);

			this.drawAxes();

			this.ctx.fillStyle = "#fff";
			this.ctx.strokeStyle = "#fff";

			this.entityRenderer.render(drawingEntity);

			const entities = getEntities();
			entities.forEach(entity => {
				this.entityRenderer.render(entity);
			});
		});
	}
}
