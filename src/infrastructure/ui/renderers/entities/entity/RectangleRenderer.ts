import type { IRectangleViewModel } from "@adapters";

import { EntityRenderer } from "./EntityRenderer.ts";

export class RectangleRenderer extends EntityRenderer {
	override render(viewModel: IRectangleViewModel) {
		super.render(viewModel);
		this.ctx.fillRect(viewModel.x, viewModel.y, viewModel.width, viewModel.height);
		this.ctx.strokeRect(viewModel.x, viewModel.y, viewModel.width, viewModel.height);
	}
}
