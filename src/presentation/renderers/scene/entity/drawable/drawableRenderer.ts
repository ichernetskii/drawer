import { Drawable } from "@/domain/entity/drawable/Drawable.ts";
import { isEllipse } from "@/domain/entity/drawable/ellipse/Ellipse.ts";
import { isRectangle } from "@/domain/entity/drawable/rectangle/Rectangle.ts";
import { Renderer } from "@/presentation/renderers/renderer.ts";
import { EllipseRenderer } from "@/presentation/renderers/scene/entity/drawable/ellipse/ellipseRenderer.ts";
import { RectangleRenderer } from "@/presentation/renderers/scene/entity/drawable/rectangle/rectangleRenderer.ts";

export type RenderOptions =
	| {
			hover: false;
	  }
	| {
			hover: true;
			zoom: number;
	  };

export class DrawableRenderer extends Renderer {
	private readonly rectangleRenderer;
	private readonly ellipseRenderer;

	constructor(ctx: CanvasRenderingContext2D) {
		super(ctx);
		this.rectangleRenderer = new RectangleRenderer(ctx);
		this.ellipseRenderer = new EllipseRenderer(ctx);
	}

	render(drawable: Drawable | null, options: RenderOptions) {
		if (!drawable || !drawable.position || !drawable.size) return;

		this.ctx.strokeStyle = options.hover ? Drawable.hoverColor : drawable.color;
		this.ctx.lineWidth = options.hover ? Drawable.hoverBorderWidth / options.zoom : drawable.borderWidth;

		if (isRectangle(drawable)) {
			this.rectangleRenderer.render(drawable, options);
		} else if (isEllipse(drawable)) {
			this.ellipseRenderer.render(drawable, options);
		}
	}
}
