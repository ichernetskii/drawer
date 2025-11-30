export abstract class AbstractRenderer {
	protected ctx: CanvasRenderingContext2D;

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}

	abstract render(...args: unknown[]): void;
}
