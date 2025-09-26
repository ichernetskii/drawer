export function retinaFix(ctx: CanvasRenderingContext2D) {
	const dpr = window.devicePixelRatio || 1;

	const cssWidth = ctx.canvas.clientWidth;
	const cssHeight = ctx.canvas.clientHeight;

	ctx.canvas.width = dpr * cssWidth;
	ctx.canvas.height = dpr * cssHeight;

	ctx.scale(dpr, dpr);
}
