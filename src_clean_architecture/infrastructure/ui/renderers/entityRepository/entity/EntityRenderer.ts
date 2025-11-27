import { type IEntityViewModel } from "@adapters";
import type { IRenderer } from "@infrastructure/ui/renderers/IRenderer.d.ts";

export abstract class EntityRenderer implements IRenderer {
	protected ctx: CanvasRenderingContext2D;

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}
	render(viewModel: IEntityViewModel) {
		this.ctx.fillStyle = viewModel.fillStyle;
		this.ctx.strokeStyle = viewModel.strokeStyle;
		this.ctx.lineWidth = viewModel.lineWidth;
	}
}
