import type { IRectangleViewModel } from "@adapters";
import { EntityRenderer } from "@infrastructure/ui/renderers/entity/EntityRenderer.ts";

export class RectangleRenderer extends EntityRenderer {
	override render(viewModel: IRectangleViewModel) {
		super.render(viewModel);
		this.ctx.fillRect(viewModel.x, viewModel.y, viewModel.width, viewModel.height);
		this.ctx.strokeRect(viewModel.x, viewModel.y, viewModel.width, viewModel.height);
	}
}
