import { Renderer } from "@/renderer/renderer.ts";
import type { RenderOptions } from "@/renderer/scene/entity/drawable/drawableRenderer.ts";
import type { Ellipse } from "@/store/entity/drawable/ellipse/ellipse.ts";

export class EllipseRenderer extends Renderer {
	render(ellipse: Ellipse, options: RenderOptions) {
		if (!ellipse.position || !ellipse.size) return;
		const { hover } = options;

		this.ctx.beginPath();
		this.ctx.ellipse(
			ellipse.position.x + ellipse.size.width / 2,
			ellipse.position.y + ellipse.size.height / 2,
			Math.abs(ellipse.size.width / 2 - (hover ? 0 : ellipse.borderWidth / 2)),
			Math.abs(ellipse.size.height / 2 - (hover ? 0 : ellipse.borderWidth / 2)),
			0,
			0,
			2 * Math.PI,
		);
		this.ctx.stroke();
	}
}
