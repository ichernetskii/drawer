import type { Grid } from "@/store/entity/grid/grid.ts";

/**
 * Renders a grid in scene coordinates.
 * Grid density adapts based on zoom level to maintain readability.
 */
export class GridRenderer {
	private readonly ctx: CanvasRenderingContext2D;

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

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

	/**
	 * Renders grid lines in scene coordinates.
	 */
	render(grid: Grid) {
		const multiplier = this.getGridStepMultiplier(grid.zoom, grid.gridStep);
		const gridStep = grid.gridStep * multiplier;

		// Grid styling
		this.ctx.strokeStyle = grid.color;
		this.ctx.lineWidth = 1 / grid.zoom;

		// Calculate grid bounds (rounded to grid step)
		const startX = Math.floor(grid.topLeft.x / gridStep) * gridStep;
		const endX = Math.ceil(grid.bottomRight.x / gridStep) * gridStep;
		const startY = Math.floor(grid.bottomRight.y / gridStep) * gridStep;
		const endY = Math.ceil(grid.topLeft.y / gridStep) * gridStep;

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
	}
}

