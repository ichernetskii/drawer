import { Renderer } from "@/renderer/renderer.ts";
import type { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";

export class SelectionPreviewRenderer extends Renderer {
	render(selectionPreview: SelectionPreview) {
		if (!selectionPreview.position || !selectionPreview.size) return;

		this.ctx.strokeRect(
			selectionPreview.position.x + selectionPreview.borderWidth / 2,
			selectionPreview.position.y + selectionPreview.borderWidth / 2,
			selectionPreview.size.width - selectionPreview.borderWidth,
			selectionPreview.size.height - selectionPreview.borderWidth,
		);
	}
}
