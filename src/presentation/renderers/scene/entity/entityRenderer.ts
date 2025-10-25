import { isDrawable } from "@/domain/entities/drawable/Drawable.ts";
import type { Entity } from "@/domain/entities/Entity.ts";
import { isGrid } from "@/domain/entities/grid/Grid.ts";
import { isSelection } from "@/domain/entities/selection/Selection.ts";
import { Renderer } from "@/presentation/renderers/renderer.ts";
import { DrawableRenderer } from "@/presentation/renderers/scene/entity/drawable/drawableRenderer.ts";
import { GridRenderer } from "@/presentation/renderers/scene/entity/grid/gridRenderer.ts";
import { SelectionRenderer } from "@/presentation/renderers/scene/entity/selection/selectionRenderer.ts";

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
