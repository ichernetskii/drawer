import { Renderer } from "@/renderer/renderer.ts";
import { SelectionBoxRenderer } from "@/renderer/scene/entity/selection/selectionBox/selectionBoxRenderer.ts";
import { SelectionHoverRenderer } from "@/renderer/scene/entity/selection/selectionHover/selectionHoverRenderer.ts";
import { SelectionPreviewRenderer } from "@/renderer/scene/entity/selection/selectionPreview/selectionPreviewRenderer.ts";
import type { Selection } from "@/store/entity/selection/selection.ts";
import { isSelectionBox } from "@/store/entity/selection/selectionBox/selectionBox.ts";
import { isSelectionHover } from "@/store/entity/selection/selectionHover/selectionHover.ts";
import { isSelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";

export class SelectionRenderer extends Renderer {
	private readonly selectionBoxRenderer;
	private readonly selectionPreviewRenderer;
	private readonly selectionHoverRenderer;

	constructor(ctx: CanvasRenderingContext2D) {
		super(ctx);
		this.selectionBoxRenderer = new SelectionBoxRenderer(ctx);
		this.selectionPreviewRenderer = new SelectionPreviewRenderer(ctx);
		this.selectionHoverRenderer = new SelectionHoverRenderer(ctx);
	}

	render(selection: Selection | null) {
		if (!selection) return;

		if (isSelectionBox(selection)) {
			this.selectionBoxRenderer.render(selection);
		} else if (isSelectionPreview(selection)) {
			this.selectionPreviewRenderer.render(selection);
		} else if (isSelectionHover(selection)) {
			this.selectionHoverRenderer.render(selection);
		}
	}
}
