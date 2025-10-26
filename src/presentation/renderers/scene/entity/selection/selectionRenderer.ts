import type { Selection } from "@/domain/entity/selection/Selection.ts";
import { isSelectionBox } from "@/domain/entity/selection/selectionBox/SelectionBox.ts";
import { isSelectionHover } from "@/domain/entity/selection/selectionHover/SelectionHover.ts";
import { isSelectionPreview } from "@/domain/entity/selection/selectionPreview/SelectionPreview.ts";
import { Renderer } from "@/presentation/renderers/renderer.ts";
import { SelectionBoxRenderer } from "@/presentation/renderers/scene/entity/selection/selectionBox/selectionBoxRenderer.ts";
import { SelectionHoverRenderer } from "@/presentation/renderers/scene/entity/selection/selectionHover/selectionHoverRenderer.ts";
import { SelectionPreviewRenderer } from "@/presentation/renderers/scene/entity/selection/selectionPreview/selectionPreviewRenderer.ts";

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
