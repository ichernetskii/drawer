import { Renderer } from "@/renderer/renderer.ts";
import type { Ellipse } from "@/store/shapes/entities/ellipse.ts";

export class EllipseRenderer extends Renderer {
	render(entity: Ellipse) {
		if (!entity.position || !entity.size) return;

		this.ctx.beginPath();
		this.ctx.ellipse(
			entity.position.x + entity.size.width / 2,
			entity.position.y + entity.size.height / 2,
			Math.abs(entity.size.width / 2),
			Math.abs(entity.size.height / 2),
			0,
			0,
			2 * Math.PI,
		);
		this.ctx.stroke();
	}
}
