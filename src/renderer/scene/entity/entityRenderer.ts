import { Renderer } from "@/renderer/renderer.ts";
import { DrawableRenderer } from "@/renderer/scene/entity/drawable/drawableRenderer.ts";
import { GridRenderer } from "@/renderer/scene/entity/grid/gridRenderer.ts";
import { SelectionRenderer } from "@/renderer/scene/entity/selection/selectionRenderer.ts";
import { isDrawable } from "@/store/entity/drawable/drawable.ts";
import type { Entity } from "@/store/entity/entity.ts";
import { isGrid } from "@/store/entity/grid/grid.ts";
import { isSelection } from "@/store/entity/selection/selection.ts";

export class EntityRenderer extends Renderer {
	private readonly drawableRenderer;
	private readonly selectionRenderer;
	private readonly gridRenderer;

	constructor(ctx: CanvasRenderingContext2D) {
		super(ctx);
		this.drawableRenderer = new DrawableRenderer(ctx);
		this.selectionRenderer = new SelectionRenderer(ctx);
		this.gridRenderer = new GridRenderer(ctx);
	}

	render(entity: Entity | null) {
		if (!entity) return;

		this.ctx.strokeStyle = entity.color;
		this.ctx.lineWidth = entity.borderWidth;

		if (isGrid(entity)) {
			this.gridRenderer.render(entity);
		} else if (isDrawable(entity)) {
			this.drawableRenderer.render(entity, { hover: false });
		} else if (isSelection(entity)) {
			this.selectionRenderer.render(entity);
		}
	}
}
