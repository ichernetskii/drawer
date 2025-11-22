import type { IRectangleViewModel } from "@adapters";
import { Renderer } from "@infrastructure/ui/renderers/Renderer.ts";

export class RectangleRenderer extends Renderer {
	render(viewModel: IRectangleViewModel) {
		super.render(viewModel);
		this.ctx.fillRect(viewModel.x, viewModel.y, viewModel.width, viewModel.height);
		this.ctx.strokeRect(viewModel.x, viewModel.y, viewModel.width, viewModel.height);
	}
}
