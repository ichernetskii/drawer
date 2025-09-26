import { Renderer } from "@/renderer/renderer.ts";
import { isEllipse } from "@/store/shapes/entities/ellipse.ts";
import type { Entity } from "@/store/shapes/entities/entity.ts";
import { isRectangle } from "@/store/shapes/entities/rectangle.ts";

import { EllipseRenderer } from "./ellipse.ts";
import { RectangleRenderer } from "./rectangle.ts";

export class EntityRenderer extends Renderer {
	private readonly rectangleRenderer;
	private readonly ellipseRenderer;

	constructor(ctx: CanvasRenderingContext2D) {
		super(ctx);
		this.rectangleRenderer = new RectangleRenderer(ctx);
		this.ellipseRenderer = new EllipseRenderer(ctx);
	}

	render(entity: Entity | null) {
		if (!entity) {
			return;
		}
		if (isEllipse(entity)) {
			this.ellipseRenderer.render(entity);
		} else if (isRectangle(entity)) {
			this.rectangleRenderer.render(entity);
		}
	}
}
