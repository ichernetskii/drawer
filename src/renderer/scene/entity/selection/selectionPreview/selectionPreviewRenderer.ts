import { Renderer } from "@/renderer/renderer.ts";
import type { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";

export class SelectionPreviewRenderer extends Renderer {
	render(entity: SelectionPreview) {
		if (!entity.position || !entity.size) return;

		this.ctx.strokeRect(
			entity.position.x + entity.borderWidth / 2,
			entity.position.y + entity.borderWidth / 2,
			entity.size.width - entity.borderWidth,
			entity.size.height - entity.borderWidth,
		);
	}
}
