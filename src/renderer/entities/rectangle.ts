import { Renderer } from "@/renderer/renderer.ts";
import type { Rectangle } from "@/store/shapes/entities/rectangle.ts";

export class RectangleRenderer extends Renderer {
	render(entity: Rectangle) {
		if (!entity.position || !entity.size) return;

		this.ctx.strokeRect(entity.position.x, entity.position.y, entity.size.width, entity.size.height);
	}
}
