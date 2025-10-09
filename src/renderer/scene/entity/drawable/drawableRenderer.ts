import { Renderer } from "@/renderer/renderer.ts";
import { EllipseRenderer } from "@/renderer/scene/entity/drawable/ellipse/ellipseRenderer.ts";
import { RectangleRenderer } from "@/renderer/scene/entity/drawable/rectangle/rectangleRenderer.ts";
import type { Drawable } from "@/store/entity/drawable/drawable.ts";
import { isEllipse } from "@/store/entity/drawable/ellipse/ellipse.ts";
import { isRectangle } from "@/store/entity/drawable/rectangle/rectangle.ts";

export class DrawableRenderer extends Renderer {
	private readonly rectangleRenderer;
	private readonly ellipseRenderer;

	constructor(ctx: CanvasRenderingContext2D) {
		super(ctx);
		this.rectangleRenderer = new RectangleRenderer(ctx);
		this.ellipseRenderer = new EllipseRenderer(ctx);
	}

	render(drawable: Drawable | null) {
		if (!drawable || !drawable.position || !drawable.size) return;

		this.ctx.strokeStyle = drawable.color;

		if (isRectangle(drawable)) {
			this.rectangleRenderer.render(drawable);
		} else if (isEllipse(drawable)) {
			this.ellipseRenderer.render(drawable);
		}
	}
}
