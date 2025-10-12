import { autorun, type IReactionDisposer } from "mobx";

import { Renderer } from "@/renderer/renderer.ts";
import { EntityRenderer } from "@/renderer/scene/entity/entityRenderer.ts";
import { type RootStore } from "@/store/rootStore.ts";
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

	private drawAxes(zoom: number) {
		const { clientWidth, clientHeight } = this.ctx.canvas;

		this.ctx.strokeStyle = "#333";
		this.ctx.lineWidth = 1 / zoom;

		const top = this.rootStore.sceneStore.getSceneCoordinates({ x: clientWidth / 2, y: 0 });
		const bottom = this.rootStore.sceneStore.getSceneCoordinates({ x: clientWidth / 2, y: clientHeight });
		const left = this.rootStore.sceneStore.getSceneCoordinates({ x: 0, y: clientHeight / 2 });
		const right = this.rootStore.sceneStore.getSceneCoordinates({ x: clientWidth, y: clientHeight / 2 });

		// centered axes (origin at 0,0 after translate)
		this.ctx.beginPath();
		// X axis
		this.ctx.moveTo(left.x, 0);
		this.ctx.lineTo(right.x, 0);
		// Y axis
		this.ctx.moveTo(0, top.y);
		this.ctx.lineTo(0, bottom.y);
		this.ctx.stroke();
	}
	render() {
		this.dispose?.();
		const { sceneStore, drawableStore, clientStore } = this.rootStore;
		retinaFix(this.ctx, clientStore.dpr);
		const { clientWidth, clientHeight } = this.ctx.canvas;
		sceneStore.size = { width: clientWidth, height: clientHeight };

		this.dispose = autorun(() => {
			// clear canvas
			this.ctx.clearRect(0, 0, clientWidth, clientHeight);

			// draw in scene coordinates with origin pivot fixed on zoom
			this.ctx.save();
			// 1) move to screen center
			this.ctx.translate(sceneStore.size.width / 2, sceneStore.size.height / 2);
			// 2) apply zoom and flip Y-up
			this.ctx.scale(sceneStore.zoom, -sceneStore.zoom);
			// 3) move scene so that origin is at screen center
			this.ctx.translate(-sceneStore.origin.x, -sceneStore.origin.y);

			this.drawAxes(sceneStore.zoom);

			this.entityRenderer.render(drawableStore.drawing);

			drawableStore.drawables.forEach(drawable => {
				this.entityRenderer.render(drawable);
			});

			// Render hover highlight before selection box to avoid z-fighting
			this.entityRenderer.render(this.rootStore.selectionStore.selectionHover);

			this.entityRenderer.render(this.rootStore.selectionStore.selectionBox);
			this.entityRenderer.render(this.rootStore.selectionStore.selectionPreview);

			this.ctx.restore();
		});
	}
}
