import "@/styles/style.css";

import { SceneRenderer } from "@/renderer/scene/sceneRenderer.ts";
import { Ellipse } from "@/store/entity/drawable/ellipse/ellipse.ts";
import { Rectangle } from "@/store/entity/drawable/rectangle/rectangle.ts";
import { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";
import { createEntity } from "@/store/entity/utils.ts";
import { rootStore } from "@/store/rootStore.ts";
import { exhaustiveCheck } from "@/utils/exhaustiveCheck.ts";

const $canvas = document.querySelector("canvas")!;
const ctx = $canvas.getContext("2d")!;
const { drawableStore, selectionStore, sceneStore } = rootStore;
const renderer = new SceneRenderer(ctx, rootStore);

renderer.render();

window.addEventListener("resize", () => {
	renderer.render();
});

$canvas.addEventListener("mousedown", e => {
	const sceneCoordinates = sceneStore.getSceneCoordinates(e);
	const drawableUnderCursor = drawableStore.getDrawableAtPosition(sceneCoordinates);
	sceneStore.mouseDown = sceneCoordinates;

	// mouse down on already selected entity
	if (drawableUnderCursor && selectionStore.drawables.includes(drawableUnderCursor)) {
		// shift + mousedown on already selected entity → clear selection
		if (e.shiftKey) {
			selectionStore.delete(drawableUnderCursor);
		}
		return;
	}

	if (!e.shiftKey) {
		selectionStore.drawables = [];
	}

	// mouse down on not selected entity
	if (drawableUnderCursor) {
		selectionStore.add(drawableUnderCursor);
		return;
	}

	// mouse down on empty space + selection tool
	if (sceneStore.tool === SelectionPreview.type) {
		selectionStore.selectionPreview = new SelectionPreview();
		selectionStore.selectionPreview.position = sceneCoordinates;
		return;
	}

	// mouse down on empty space
	const entity = createEntity(sceneStore.tool);
	if (!entity) return;
	entity.position = sceneCoordinates;
	drawableStore.drawing = entity;
});

$canvas.addEventListener("mousemove", e => {
	const { drawing } = drawableStore;
	const { selectionPreview, drawables } = selectionStore;
	const isMainMouseButtonPressed = e.buttons === 1;
	const sceneCoordinates = sceneStore.getSceneCoordinates(e);

	if (!isMainMouseButtonPressed) return;

	if (drawing && drawing.position) {
		drawing.size = {
			width: sceneCoordinates.x - drawing.position.x,
			height: sceneCoordinates.y - drawing.position.y,
		};
		return;
	}

	// selection
	if (selectionPreview && selectionPreview.position) {
		selectionPreview.size = {
			width: sceneCoordinates.x - selectionPreview.position.x,
			height: sceneCoordinates.y - selectionPreview.position.y,
		};
		return;
	}

	// drag selected drawables
	if (drawables.length !== 0) {
		drawables.forEach(entity => {
			if (entity.position) {
				entity.position = {
					x: entity.position.x + e.movementX / sceneStore.zoom,
					y: entity.position.y - e.movementY / sceneStore.zoom,
				};
			}
		});
		return;
	}
});

$canvas.addEventListener("mouseup", e => {
	const { drawing, addDrawable } = drawableStore;
	const { selectionPreview } = selectionStore;
	const sceneCoordinates = sceneStore.getSceneCoordinates(e);

	// we have finished selection
	if (selectionPreview) {
		selectionPreview.normalize();
		const selectedDrawables = drawableStore.getDrawablesInRectangle(selectionPreview);
		if (e.shiftKey) {
			selectionStore.addMany(selectedDrawables);
		} else {
			selectionStore.drawables = selectedDrawables;
		}
		sceneStore.mouseDown = null;
		selectionStore.selectionPreview = null;
		return;
	}

	// we have finished drawing of entity
	if (drawing) {
		if (drawing.hasSize) {
			drawing.normalize();
			addDrawable(drawing);
		}
		drawableStore.drawing = null;
		sceneStore.mouseDown = null;
		return;
	}

	// click on one entity from an already selected group → select only that one
	if (
		sceneStore.mouseDown &&
		sceneCoordinates.x === sceneStore.mouseDown.x &&
		sceneCoordinates.y === sceneStore.mouseDown.y &&
		!e.shiftKey
	) {
		const drawableUnderCursor = drawableStore.getDrawableAtPosition(sceneCoordinates);
		selectionStore.drawables = [];
		if (drawableUnderCursor) {
			selectionStore.add(drawableUnderCursor);
		}
		sceneStore.mouseDown = null;
	}
});

document.addEventListener("keydown", e => {
	switch (e.key) {
		case "Escape":
			selectionStore.drawables = [];
			break;
		case "Backspace":
		case "Delete":
			drawableStore.deleteDrawables(selectionStore.drawables);
			selectionStore.drawables = [];
			break;
		case "ArrowRight":
		case "ArrowLeft":
		case "ArrowUp":
		case "ArrowDown": {
			let dx = 0;
			let dy = 0;
			const translateStep = sceneStore.getKeyTranslateStep(e);
			switch (e.key) {
				case "ArrowRight":
					dx = translateStep;
					break;
				case "ArrowLeft":
					dx = -translateStep;
					break;
				case "ArrowUp":
					dy = translateStep;
					break;
				case "ArrowDown":
					dy = -translateStep;
					break;
				default:
					exhaustiveCheck(e.key);
			}
			if (selectionStore.drawables.length !== 0) {
				selectionStore.drawables.forEach(entity => {
					if (entity.position) {
						entity.position = {
							x: entity.position.x + dx,
							y: entity.position.y + dy,
						};
					}
				});
			} else {
				sceneStore.translateOriginBy({ x: dx, y: dy });
			}
			break;
		}
		case "r":
			sceneStore.tool = Rectangle.type;
			break;
		case "e":
			sceneStore.tool = Ellipse.type;
			break;
		case "s":
			sceneStore.tool = SelectionPreview.type;
			break;
		case "+":
			sceneStore.zoom = sceneStore.zoom * sceneStore.zoomFactor;
			break;
		case "-":
			sceneStore.zoom = sceneStore.zoom / sceneStore.zoomFactor;
			break;
		case "=":
			sceneStore.zoom = 1;
			break;
	}
});

$canvas.addEventListener("contextmenu", e => {
	e.preventDefault();
});

// Wheel: pan/zoom with trackpad and mouse
$canvas.addEventListener(
	"wheel",
	(e: WheelEvent) => {
		e.preventDefault();

		// Zoom: Cmd (mac) or Ctrl (pc) + wheel; also covers pinch on many touchpads
		if (e.metaKey || e.ctrlKey) {
			const sceneCoordinates = sceneStore.getSceneCoordinates(e);
			const factor = sceneStore.getWheelZoomFactor(e);
			sceneStore.zoomAtSceneCoordinates(sceneCoordinates, factor);
			return;
		}

		// Shift + mouse wheel → horizontal scroll
		if (e.shiftKey) {
			sceneStore.translateOriginBy({ x: e.deltaY / sceneStore.zoom, y: 0 });
			return;
		}

		// Trackpad two-finger pan (both axes) or mouse wheel (vertical only)
		sceneStore.translateOriginBy({ x: e.deltaX / sceneStore.zoom, y: -e.deltaY / sceneStore.zoom });
	},
	{ passive: false },
);
