import { Renderer } from "@/renderer/renderer.ts";
import type { Selection } from "@/store/entities/selection.ts";

export class SelectionRenderer extends Renderer {
	constructor(ctx: CanvasRenderingContext2D) {
		super(ctx);
	}

	render(selection: Selection) {
		if (!selection.position || !selection.size) return;
		this.ctx.strokeStyle = selection.color;
		this.ctx.lineWidth = selection.borderWidth;
		this.ctx.strokeRect(selection.position.x, selection.position.y, selection.size.width, selection.size.height);
	}
}
