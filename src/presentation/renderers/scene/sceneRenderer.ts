import { autorun, type IReactionDisposer } from "mobx";

import { Renderer } from "@/presentation/renderers/renderer.ts";
import { EntityRenderer } from "@/presentation/renderers/scene/entity/entityRenderer.ts";
import { retinaFix } from "@/shared/utils/retinaFix.ts";
import { type RootStore } from "@/store/rootStore.ts";

export class SceneRenderer extends Renderer {
	private readonly rootStore;
	private readonly entityRenderer;
	private dispose?: IReactionDisposer;

	constructor(ctx: CanvasRenderingContext2D, rootStore: RootStore) {
		super(ctx);
		this.rootStore = rootStore;
		this.entityRenderer = new EntityRenderer(this.ctx);
	}

	render() {
		this.dispose?.();
		const { sceneStore, drawableStore, clientStore } = this.rootStore;
		retinaFix(this.ctx, clientStore.dpr);
		const { clientWidth, clientHeight } = this.ctx.canvas;
		sceneStore.setSize({ width: clientWidth, height: clientHeight });

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

			if (sceneStore.isGridVisible) this.entityRenderer.render(sceneStore.grid);

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
