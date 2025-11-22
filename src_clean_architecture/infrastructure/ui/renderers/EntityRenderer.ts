import { type IEntityViewModel, isRectangleViewModel, isTextViewModel } from "@adapters";
import { RectangleRenderer } from "@infrastructure/ui/renderers/RectangleRenderer.ts";
import { Renderer } from "@infrastructure/ui/renderers/Renderer.ts";
import { TextRenderer } from "@infrastructure/ui/renderers/TextRenderer.ts";

export class EntityRenderer extends Renderer {
	render(viewModel: IEntityViewModel) {
		if (isRectangleViewModel(viewModel)) {
			new RectangleRenderer(this.ctx).render(viewModel);
			return;
		}

		if (isTextViewModel(viewModel)) {
			new TextRenderer(this.ctx).render(viewModel);
			return;
		}

		throw new Error(`Unknown viewModel type: ${viewModel.type}`);
	}
}
