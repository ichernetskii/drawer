import { type IEntityViewModel } from "@adapters";
import { AbstractRenderer } from "@infrastructure/ui/renderers/AbstractRenderer.ts";

export abstract class EntityRenderer extends AbstractRenderer {
	render(viewModel: IEntityViewModel) {
		this.ctx.fillStyle = viewModel.fillStyle;
		this.ctx.strokeStyle = viewModel.strokeStyle;
		this.ctx.lineWidth = viewModel.lineWidth;
	}
}
