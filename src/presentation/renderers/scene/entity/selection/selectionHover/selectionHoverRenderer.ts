import type { SelectionHover } from "@/domain/entity/selection/selectionHover/SelectionHover.ts";
import { Renderer } from "@/presentation/renderers/renderer.ts";
import { DrawableRenderer } from "@/presentation/renderers/scene/entity/drawable/drawableRenderer.ts";

/**
 * Renders hover highlight for drawables.
 * Draws an outline following the drawable's geometric shape.
 */
export class SelectionHoverRenderer extends Renderer {
	render(selectionHover: SelectionHover) {
		const { drawable } = selectionHover;
		if (!drawable || !drawable.position || !drawable.size) return;

		const drawableRenderer = new DrawableRenderer(this.ctx);
		drawableRenderer.render(drawable, {
			hover: true,
			zoom: selectionHover.zoom,
		});
	}
}
