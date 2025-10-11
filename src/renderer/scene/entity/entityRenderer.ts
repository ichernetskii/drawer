import { Renderer } from "@/renderer/renderer.ts";
import { DrawableRenderer } from "@/renderer/scene/entity/drawable/drawableRenderer.ts";
import { SelectionRenderer } from "@/renderer/scene/entity/selection/selectionRenderer.ts";
import { isDrawable } from "@/store/entity/drawable/drawable.ts";
import type { Entity } from "@/store/entity/entity.ts";
import { isSelection } from "@/store/entity/selection/selection.ts";

export class EntityRenderer extends Renderer {
	private readonly drawableRenderer;
	private readonly selectionRenderer;

	constructor(ctx: CanvasRenderingContext2D) {
		super(ctx);
		this.drawableRenderer = new DrawableRenderer(ctx);
		this.selectionRenderer = new SelectionRenderer(ctx);
	}

	render(entity: Entity | null) {
		if (!entity || !entity.position || !entity.size) return;

		this.ctx.strokeStyle = entity.color;
		this.ctx.lineWidth = entity.borderWidth;

		if (isDrawable(entity)) {
			this.drawableRenderer.render(entity);
		} else if (isSelection(entity)) {
			this.selectionRenderer.render(entity);
		}
	}
}
