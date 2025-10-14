import "@/shared/styles/main.css";

import { KeyboardController } from "@/core/controllers/keyboardController.ts";
import { MouseController } from "@/core/controllers/mouseController.ts";
import { ToolbarController } from "@/core/controllers/toolbarController.ts";
import { WheelController } from "@/core/controllers/wheelController.ts";
import { DrawingOperation } from "@/core/operations/drawingOperation.ts";
import { NavigationOperation } from "@/core/operations/navigationOperation.ts";
import { SelectionOperation } from "@/core/operations/selectionOperation.ts";
import { SceneRenderer } from "@/renderer/scene/sceneRenderer.ts";
import { RootStore } from "@/store/rootStore.ts";

const $canvas = document.querySelector("canvas")!;
const $toolbar = document.getElementById("toolbar")!;
const ctx = $canvas.getContext("2d")!;

const rootStore = new RootStore();
const { drawableStore, selectionStore, sceneStore } = rootStore;

drawableStore.load();
sceneStore.load();

const renderer = new SceneRenderer(ctx, rootStore);

const drawingOperation = new DrawingOperation(drawableStore, sceneStore);
const selectionOperation = new SelectionOperation(selectionStore, drawableStore, sceneStore);
const navigationOperation = new NavigationOperation(sceneStore, selectionStore);

const mouseController = new MouseController(
	$canvas,
	drawingOperation,
	selectionOperation,
	drawableStore,
	selectionStore,
	sceneStore,
);
const keyboardController = new KeyboardController(navigationOperation, selectionOperation, sceneStore, selectionStore);
const wheelController = new WheelController($canvas, navigationOperation, sceneStore);
const toolbarController = new ToolbarController($toolbar, sceneStore);

mouseController.init();
keyboardController.init();
wheelController.init();
toolbarController.init();

window.addEventListener("resize", () => {
	renderer.render();
});

renderer.render();

// HMR cleanup for development
if (import.meta.hot) {
	import.meta.hot.dispose(() => {
		mouseController.destroy();
		keyboardController.destroy();
		wheelController.destroy();
		toolbarController.destroy();
	});
}
