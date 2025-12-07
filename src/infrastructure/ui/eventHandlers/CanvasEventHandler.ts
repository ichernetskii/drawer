import { MouseController } from "@adapters";

export class CanvasEventHandler {
	$canvas: HTMLCanvasElement;
	mouseController: MouseController;

	constructor($canvas: HTMLCanvasElement, mouseController: MouseController) {
		this.$canvas = $canvas;
		this.mouseController = mouseController;
	}

	subscribe() {
		const abortController = new AbortController();
		const signal = abortController.signal;
		this.$canvas.addEventListener("mousedown", this.mouseController.onMouseDown, { signal });
		this.$canvas.addEventListener("mousemove", this.mouseController.onMouseMove, { signal });
		this.$canvas.addEventListener("mouseup", this.mouseController.onMouseUp, { signal });
		this.$canvas.addEventListener("contextmenu", this.mouseController.onContextMenu, { signal });

		return () => {
			abortController.abort();
		};
	}
}
