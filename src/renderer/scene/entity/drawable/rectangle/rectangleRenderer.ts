import { Renderer } from "@/renderer/renderer.ts";
import type { RenderOptions } from "@/renderer/scene/entity/drawable/drawableRenderer.ts";
import type { Rectangle } from "@/store/entity/drawable/rectangle/rectangle.ts";

export class RectangleRenderer extends Renderer {
	render(rectangle: Rectangle, options: RenderOptions) {
		if (!rectangle.position || !rectangle.size) return;
		const { hover } = options;

		this.ctx.strokeRect(
			rectangle.position.x + (hover ? 0 : rectangle.borderWidth / 2),
			rectangle.position.y + (hover ? 0 : rectangle.borderWidth / 2),
			rectangle.size.width - (hover ? 0 : rectangle.borderWidth),
			rectangle.size.height - (hover ? 0 : rectangle.borderWidth),
		);
	}
}
