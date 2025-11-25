import { type IEntityViewModel } from "@adapters";

export abstract class EntityRenderer {
	ctx: CanvasRenderingContext2D;

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

	render(viewModel: IEntityViewModel) {
		this.ctx.fillStyle = viewModel.fillStyle;
		this.ctx.strokeStyle = viewModel.strokeStyle;
		this.ctx.lineWidth = viewModel.lineWidth;
	}
}
