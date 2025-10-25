import type { Ellipse } from "@/domain/entities/drawable/ellipse/Ellipse.ts";
import { Renderer } from "@/presentation/renderers/renderer.ts";
import type { RenderOptions } from "@/presentation/renderers/scene/entity/drawable/drawableRenderer.ts";

export class EllipseRenderer extends Renderer {
	render(ellipse: Ellipse, options: RenderOptions) {
		if (!ellipse.position || !ellipse.size) return;
		const borderWidth = options.hover ? 0 : ellipse.borderWidth;

		this.ctx.beginPath();
		this.ctx.ellipse(
			ellipse.position.x + ellipse.size.width / 2,
			ellipse.position.y + ellipse.size.height / 2,
			Math.abs(ellipse.size.width / 2 - borderWidth / 2),
			Math.abs(ellipse.size.height / 2 - borderWidth / 2),
			0,
			0,
			2 * Math.PI,
		);
		this.ctx.stroke();
	}
}
