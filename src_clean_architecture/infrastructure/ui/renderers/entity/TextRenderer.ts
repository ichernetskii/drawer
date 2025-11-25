import type { ITextViewModel } from "@adapters";
import { EntityRenderer } from "@infrastructure/ui/renderers/entity/EntityRenderer.ts";

export class TextRenderer extends EntityRenderer {
	override render(viewModel: ITextViewModel) {
		super.render(viewModel);
		this.ctx.font = viewModel.font;
		this.ctx.fillText(viewModel.text, viewModel.x, viewModel.y);
	}
}
