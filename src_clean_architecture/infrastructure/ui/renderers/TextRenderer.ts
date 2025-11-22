import type { ITextViewModel } from "@adapters";
import { Renderer } from "@infrastructure/ui/renderers/Renderer.ts";

export class TextRenderer extends Renderer {
	render(viewModel: ITextViewModel) {
		super.render(viewModel);
		this.ctx.font = viewModel.font;
		this.ctx.fillText(viewModel.text, viewModel.x, viewModel.y);
	}
}
