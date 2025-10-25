import type { Rectangle } from "@/domain/entities/drawable/rectangle/Rectangle.ts";
import { Renderer } from "@/presentation/renderers/renderer.ts";
import type { RenderOptions } from "@/presentation/renderers/scene/entity/drawable/drawableRenderer.ts";

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
