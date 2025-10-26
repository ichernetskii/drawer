import type { Grid } from "@/domain/entity/grid/Grid.ts";
import { Renderer } from "@/presentation/renderers/renderer.ts";
import { snapToGridCeil, snapToGridFloor } from "@/shared/utils/snap.ts";

export class GridRenderer extends Renderer {
	/**
	 * Calculates appropriate grid step multiplier based on zoom level.
	 * Returns multiplier (1, 2, 5, 10, 20, 50, 100, etc.)
	 */
	private getGridStepMultiplier(zoom: number, baseGridStep: number): number {
		// Minimum visual spacing in pixels on screen
		const minVisualSpacing = 20;

		// Current visual spacing of base grid
		const currentVisualSpacing = baseGridStep * zoom;

		// If grid is too dense, multiply step
		if (currentVisualSpacing < minVisualSpacing) {
			const ratio = minVisualSpacing / currentVisualSpacing;

			// Use nice round numbers: 1, 2, 5, 10, 20, 50, 100...
			const power = Math.floor(Math.log10(ratio));
			const normalized = ratio / Math.pow(10, power);

			let multiplier: number;
			if (normalized < 2) {
				multiplier = 2;
			} else if (normalized < 5) {
				multiplier = 5;
			} else {
				multiplier = 10;
			}

			return multiplier * Math.pow(10, power);
		}

		return 1;
	}

	render(grid: Grid) {
		const multiplier = this.getGridStepMultiplier(grid.zoom, grid.gridStep);
		const gridStep = grid.gridStep * multiplier;

		// Calculate grid bounds (rounded to grid step)
		const startX = snapToGridFloor(grid.topLeft.x, gridStep);
		const endX = snapToGridCeil(grid.bottomRight.x, gridStep);
		const startY = snapToGridFloor(grid.bottomRight.y, gridStep);
		const endY = snapToGridCeil(grid.topLeft.y, gridStep);

		this.ctx.strokeStyle = grid.color;
		this.ctx.lineWidth = 1 / grid.zoom;
		this.ctx.beginPath();

		// Vertical lines
		for (let x = startX; x <= endX; x += gridStep) {
			this.ctx.moveTo(x, startY);
			this.ctx.lineTo(x, endY);
		}

		// Horizontal lines
		for (let y = startY; y <= endY; y += gridStep) {
			this.ctx.moveTo(startX, y);
			this.ctx.lineTo(endX, y);
		}

		this.ctx.stroke();

		// Draw center axes
		this.ctx.beginPath();
		this.ctx.lineWidth = 2 / grid.zoom;

		this.ctx.moveTo(startX, 0);
		this.ctx.lineTo(endX, 0);

		this.ctx.moveTo(0, startY);
		this.ctx.lineTo(0, endY);

		this.ctx.stroke();
	}
}
