import { Renderer } from "@/renderer/renderer.ts";
import type { Rectangle } from "@/store/entity/drawable/rectangle/rectangle.ts";

export class RectangleRenderer extends Renderer {
	render(entity: Rectangle) {
		if (!entity.position || !entity.size) return;

		this.ctx.strokeRect(
			entity.position.x + entity.borderWidth / 2,
			entity.position.y + entity.borderWidth / 2,
			entity.size.width - entity.borderWidth,
			entity.size.height - entity.borderWidth,
		);
	}
}
