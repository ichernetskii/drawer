import "@/shared/styles/main.css";

import { ClipboardOperation } from "@/application/operations/clipboardOperation.ts";
import { DrawingOperation } from "@/application/operations/drawingOperation.ts";
import { HoverOperation } from "@/application/operations/hoverOperation.ts";
import { MoveOperation } from "@/application/operations/moveOperation.ts";
import { NavigationOperation } from "@/application/operations/navigationOperation.ts";
import { ResizeOperation } from "@/application/operations/resizeOperation.ts";
import { SelectionBoxOperation } from "@/application/operations/selectionBoxOperation.ts";
import { SelectionPreviewOperation } from "@/application/operations/selectionPreviewOperation.ts";
import {
	type DrawableStoreStorable,
	type SceneStoreStorable,
	StorageService,
} from "@/application/services/StorageService.ts";
import { ClipboardAdapter } from "@/infrastructure/clipboard/ClipboardAdapter.ts";
import { LocalStorageAdapter } from "@/infrastructure/storage/LocalStorageAdapter.ts";
import { KeyboardController } from "@/presentation/controllers/keyboardController.ts";
import { MouseController } from "@/presentation/controllers/mouseController.ts";
import { ToolbarController } from "@/presentation/controllers/toolbarController.ts";
import { WheelController } from "@/presentation/controllers/wheelController.ts";
import { SceneRenderer } from "@/presentation/renderers/scene/sceneRenderer.ts";
import { RootStore } from "@/store/rootStore.ts";

const $canvas = document.querySelector("canvas")!;
const $toolbar = document.getElementById("toolbar")!;
const ctx = $canvas.getContext("2d")!;

const rootStore = new RootStore();

// Adapters
const clipboardAdapter = new ClipboardAdapter();
const drawableStorageAdapter = new LocalStorageAdapter<DrawableStoreStorable>("drawableStore");
const sceneStorageAdapter = new LocalStorageAdapter<SceneStoreStorable>("sceneStore");

// Services
const storageService = new StorageService(rootStore, drawableStorageAdapter, sceneStorageAdapter);
storageService.load();

rootStore.historyStore.push(rootStore.drawableStore.drawables);

const renderer = new SceneRenderer(ctx, rootStore);

// Operations
const drawingOperation = new DrawingOperation(rootStore);
const navigationOperation = new NavigationOperation(rootStore);
const selectionBoxOperation = new SelectionBoxOperation(rootStore);
const clipboardOperation = new ClipboardOperation(rootStore, clipboardAdapter);
const selectionPreviewOperation = new SelectionPreviewOperation(rootStore);
const moveOperation = new MoveOperation(rootStore);
const resizeOperation = new ResizeOperation(rootStore);
const hoverOperation = new HoverOperation(rootStore);

// Controllers
const mouseController = new MouseController(
	$canvas,
	drawingOperation,
	selectionBoxOperation,
	selectionPreviewOperation,
	moveOperation,
	resizeOperation,
	hoverOperation,
	rootStore,
);
const keyboardController = new KeyboardController(
	navigationOperation,
	selectionBoxOperation,
	clipboardOperation,
	moveOperation,
	rootStore,
);
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
		storageService.dispose();
		rootStore.dispose();
	});
}
