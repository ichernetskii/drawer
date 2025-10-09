import { Renderer } from "@/renderer/renderer.ts";
import type { SelectionBox } from "@/store/entity/selection/selectionBox/selectionBox.ts";

export class SelectionBoxRenderer extends Renderer {
	render(selection: SelectionBox) {
		if (!selection.position || !selection.size) return;
		this.ctx.strokeStyle = selection.color;
		this.ctx.lineWidth = selection.borderWidth;
		this.ctx.strokeRect(selection.position.x, selection.position.y, selection.size.width, selection.size.height);
	}
}
