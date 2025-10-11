import { Renderer } from "@/renderer/renderer.ts";
import type { Rectangle } from "@/store/entity/drawable/rectangle/rectangle.ts";

export class RectangleRenderer extends Renderer {
	render(rectangle: Rectangle) {
		if (!rectangle.position || !rectangle.size) return;

		this.ctx.strokeRect(
			rectangle.position.x + rectangle.borderWidth / 2,
			rectangle.position.y + rectangle.borderWidth / 2,
			rectangle.size.width - rectangle.borderWidth,
			rectangle.size.height - rectangle.borderWidth,
		);
	}
}
