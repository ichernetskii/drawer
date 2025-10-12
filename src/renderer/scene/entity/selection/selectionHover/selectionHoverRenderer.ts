import { Renderer } from "@/renderer/renderer.ts";
import { DrawableRenderer } from "@/renderer/scene/entity/drawable/drawableRenderer.ts";
import type { SelectionHover } from "@/store/entity/selection/selectionHover/selectionHover.ts";

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
