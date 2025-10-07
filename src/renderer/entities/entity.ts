import { SelectionRenderer } from "@/renderer/entities/selection.ts";
import { Renderer } from "@/renderer/renderer.ts";
import { isEllipse } from "@/store/entities/ellipse.ts";
import type { Entity } from "@/store/entities/entity.ts";
import { isRectangle } from "@/store/entities/rectangle.ts";
import { isSelection } from "@/store/entities/selection.ts";
import { exhaustiveCheck } from "@/utils/exhaustiveCheck.ts";

import { EllipseRenderer } from "./ellipse.ts";
import { RectangleRenderer } from "./rectangle.ts";

export class EntityRenderer extends Renderer {
	private readonly rectangleRenderer;
	private readonly ellipseRenderer;
	private readonly selectionRenderer;

	constructor(ctx: CanvasRenderingContext2D) {
		super(ctx);
		this.rectangleRenderer = new RectangleRenderer(ctx);
		this.ellipseRenderer = new EllipseRenderer(ctx);
		this.selectionRenderer = new SelectionRenderer(ctx);
	}

	render(entity: Entity | null) {
		if (!entity || !entity.position || !entity.size) return;

		this.ctx.strokeStyle = entity.color;

		if (isRectangle(entity)) {
			this.rectangleRenderer.render(entity);
		} else if (isEllipse(entity)) {
			this.ellipseRenderer.render(entity);
		} else if (isSelection(entity)) {
			this.selectionRenderer.render(entity);
		} else exhaustiveCheck(entity);
	}
}
