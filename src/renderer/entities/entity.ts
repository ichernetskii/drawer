import { Renderer } from "@/renderer/renderer.ts";
import { isEllipse } from "@/store/shapes/entities/ellipse.ts";
import type { Entity } from "@/store/shapes/entities/entity.ts";
import { isRectangle } from "@/store/shapes/entities/rectangle.ts";

import { EllipseRenderer } from "./ellipse.ts";
import { RectangleRenderer } from "./rectangle.ts";

export class EntityRenderer extends Renderer {
	readonly SELECTION_PADDING = 3;
	readonly SELECTION_COLOR = "#6dcd51";

	private readonly rectangleRenderer;
	private readonly ellipseRenderer;

	constructor(ctx: CanvasRenderingContext2D) {
		super(ctx);
		this.rectangleRenderer = new RectangleRenderer(ctx);
		this.ellipseRenderer = new EllipseRenderer(ctx);
	}

	render(entity: Entity | null) {
		if (!entity || !entity.position || !entity.size) return;

		if (entity.isSelected) {
			this.ctx.strokeStyle = this.SELECTION_COLOR;
			this.ctx.strokeRect(
				entity.position.x - this.SELECTION_PADDING,
				entity.position.y - this.SELECTION_PADDING,
				entity.size.width + 2 * this.SELECTION_PADDING,
				entity.size.height + 2 * this.SELECTION_PADDING,
			);
		}

		this.ctx.strokeStyle = entity.color;
		if (isRectangle(entity)) {
			this.rectangleRenderer.render(entity);
		} else if (isEllipse(entity)) {
			this.ellipseRenderer.render(entity);
		}
	}
}
