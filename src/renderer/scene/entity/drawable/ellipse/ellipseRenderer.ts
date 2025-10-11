import { Renderer } from "@/renderer/renderer.ts";
import type { Ellipse } from "@/store/entity/drawable/ellipse/ellipse.ts";

export class EllipseRenderer extends Renderer {
	render(ellipse: Ellipse) {
		if (!ellipse.position || !ellipse.size) return;

		this.ctx.beginPath();
		this.ctx.ellipse(
			ellipse.position.x + ellipse.size.width / 2,
			ellipse.position.y + ellipse.size.height / 2,
			Math.abs(ellipse.size.width / 2 - ellipse.borderWidth / 2),
			Math.abs(ellipse.size.height / 2 - ellipse.borderWidth / 2),
			0,
			0,
			2 * Math.PI,
		);
		this.ctx.stroke();
	}
}
