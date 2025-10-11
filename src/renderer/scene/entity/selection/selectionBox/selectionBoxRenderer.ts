import { Renderer } from "@/renderer/renderer.ts";
import type { SelectionBox } from "@/store/entity/selection/selectionBox/selectionBox.ts";

export class SelectionBoxRenderer extends Renderer {
	render(selectionBox: SelectionBox) {
		if (!selectionBox.position || !selectionBox.size) return;

		this.ctx.strokeRect(
			selectionBox.position.x + selectionBox.borderWidth / 2,
			selectionBox.position.y + selectionBox.borderWidth / 2,
			selectionBox.size.width - selectionBox.borderWidth,
			selectionBox.size.height - selectionBox.borderWidth,
		);
	}
}
