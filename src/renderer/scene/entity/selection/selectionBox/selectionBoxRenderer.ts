import { Renderer } from "@/renderer/renderer.ts";
import { SelectionBox } from "@/store/entity/selection/selectionBox/selectionBox.ts";

export class SelectionBoxRenderer extends Renderer {
	render(selectionBox: SelectionBox) {
		if (!selectionBox.position || !selectionBox.size) return;

		// Draw selection box border
		this.ctx.strokeRect(
			selectionBox.position.x + selectionBox.borderWidth / 2,
			selectionBox.position.y + selectionBox.borderWidth / 2,
			selectionBox.size.width - selectionBox.borderWidth,
			selectionBox.size.height - selectionBox.borderWidth,
		);

		// Draw corner handles
		this.renderHandles(selectionBox);
	}

	private renderHandles(selectionBox: SelectionBox) {
		if (!selectionBox.position || !selectionBox.size) return;

		const { zoom } = selectionBox;
		const { handleConfig } = SelectionBox;

		const handleSize = handleConfig.size / zoom;
		const handleBorderWidth = handleConfig.borderWidth / zoom;
		const halfSize = handleSize / 2;

		// Calculate corner positions (centered on corners of selection box)
		const left = selectionBox.position.x;
		const right = selectionBox.position.x + selectionBox.size.width;
		const bottom = selectionBox.position.y;
		const top = selectionBox.position.y + selectionBox.size.height;

		const corners = [
			{ x: left, y: top }, // top-left
			{ x: right, y: top }, // top-right
			{ x: left, y: bottom }, // bottom-left
			{ x: right, y: bottom }, // bottom-right
		];

		// Apply handle styles
		this.ctx.strokeStyle = handleConfig.borderColor;
		this.ctx.lineWidth = handleBorderWidth;
		this.ctx.fillStyle = handleConfig.fillColor;

		// Draw each handle
		for (const corner of corners) {
			const handleX = corner.x - halfSize;
			const handleY = corner.y - halfSize;

			// Fill
			this.ctx.fillRect(
				handleX + handleBorderWidth / 2,
				handleY + handleBorderWidth / 2,
				handleSize - handleBorderWidth,
				handleSize - handleBorderWidth,
			);

			// Border
			this.ctx.strokeRect(
				handleX + handleBorderWidth / 2,
				handleY + handleBorderWidth / 2,
				handleSize - handleBorderWidth,
				handleSize - handleBorderWidth,
			);
		}
	}
}
