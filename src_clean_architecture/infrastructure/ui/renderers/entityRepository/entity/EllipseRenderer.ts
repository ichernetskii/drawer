import type { IEllipseViewModel } from "@adapters";

import { EntityRenderer } from "./EntityRenderer.ts";

export class EllipseRenderer extends EntityRenderer {
	override render(viewModel: IEllipseViewModel) {
		super.render(viewModel);

		this.ctx.beginPath();
		this.ctx.ellipse(
			viewModel.x + viewModel.width / 2,
			viewModel.y + viewModel.height / 2,
			Math.abs(viewModel.width / 2),
			Math.abs(viewModel.height / 2),
			0,
			0,
			2 * Math.PI,
		);
		this.ctx.stroke();
	}
}
