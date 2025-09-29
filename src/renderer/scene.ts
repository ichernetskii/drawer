import { autorun, type IReactionDisposer } from "mobx";

import { EntityRenderer } from "@/renderer/entities/entity.ts";
import { Renderer } from "@/renderer/renderer.ts";
import { type RootStore } from "@/store/root.ts";
import { retinaFix } from "@/utils/retinaFix.ts";

export class SceneRenderer extends Renderer {
	private readonly rootStore;
	private readonly entityRenderer;
	private dispose?: IReactionDisposer;

	constructor(ctx: CanvasRenderingContext2D, rootStore: RootStore) {
		super(ctx);
		this.rootStore = rootStore;
		this.entityRenderer = new EntityRenderer(this.ctx);
	}

	private drawAxes() {
		const { clientWidth: width, clientHeight: height } = this.ctx.canvas;

		this.ctx.strokeStyle = "#333";
		this.ctx.lineWidth = 1;

		// centered axes (origin at 0,0 after translate)
		this.ctx.beginPath();
		// X axis
		this.ctx.moveTo(-width / 2, 0);
		this.ctx.lineTo(width / 2, 0);
		// Y axis
		this.ctx.moveTo(0, -height / 2);
		this.ctx.lineTo(0, height / 2);
		this.ctx.stroke();
	}
	render() {
		this.dispose?.();
		retinaFix(this.ctx);
		const { sceneStore, shapesStore } = this.rootStore;
		const { clientWidth: width, clientHeight: height } = this.ctx.canvas;
		sceneStore.size = { width: width, height: height };

		this.dispose = autorun(() => {
			// clear canvas
			this.ctx.clearRect(0, 0, width, height);

			// draw in world coordinates with origin pivot fixed on zoom
			this.ctx.save();
			// 1) move to screen center
			this.ctx.translate(width / 2, height / 2);
			// 2) apply zoom and flip Y-up
			this.ctx.scale(sceneStore.zoom, -sceneStore.zoom);
			// 3) move world so that origin is at screen center
			this.ctx.translate(-sceneStore.origin.x, -sceneStore.origin.y);

			this.drawAxes();

			this.ctx.fillStyle = "#fff";
			this.ctx.strokeStyle = "#fff";

			this.entityRenderer.render(shapesStore.drawingEntity);

			shapesStore.entities.forEach(entity => {
				this.entityRenderer.render(entity);
			});

			this.ctx.restore();
		});
	}
}
