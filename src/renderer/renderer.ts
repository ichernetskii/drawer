export abstract class Renderer {
	protected readonly ctx: CanvasRenderingContext2D;
	abstract render(...args: unknown[]): void;

	constructor(ctx: CanvasRenderingContext2D) {
		this.ctx = ctx;
	}
}
