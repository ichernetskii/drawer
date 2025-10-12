import { Renderer } from "@/renderer/renderer.ts";
import type { RenderOptions } from "@/renderer/scene/entity/drawable/drawableRenderer.ts";
import type { Rectangle } from "@/store/entity/drawable/rectangle/rectangle.ts";

export class RectangleRenderer extends Renderer {
	render(rectangle: Rectangle, options: RenderOptions) {
		if (!rectangle.position || !rectangle.size) return;
		const borderWidth = options.hover ? 0 : rectangle.borderWidth;

		this.ctx.strokeRect(
			rectangle.position.x + borderWidth / 2,
			rectangle.position.y + borderWidth / 2,
			rectangle.size.width - borderWidth,
			rectangle.size.height - borderWidth,
		);
	}
}
