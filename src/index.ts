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

rootStore.drawableStore.load();
rootStore.sceneStore.load();
rootStore.historyStore.push(rootStore.drawableStore.drawables);

const renderer = new SceneRenderer(ctx, rootStore);

const drawingOperation = new DrawingOperation(rootStore);
const selectionOperation = new SelectionOperation(rootStore);
const navigationOperation = new NavigationOperation(rootStore);

const mouseController = new MouseController($canvas, drawingOperation, selectionOperation, rootStore);
const keyboardController = new KeyboardController(navigationOperation, selectionOperation, rootStore);
const wheelController = new WheelController($canvas, navigationOperation, rootStore);
const toolbarController = new ToolbarController($toolbar, rootStore);

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
		mouseController.dispose();
		keyboardController.dispose();
		wheelController.dispose();
		toolbarController.dispose();
		rootStore.dispose();
	});
}
