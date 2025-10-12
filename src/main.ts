import "@/styles/style.css";

import { SceneRenderer } from "@/renderer/scene/sceneRenderer.ts";
import { Ellipse } from "@/store/entity/drawable/ellipse/ellipse.ts";
import { Rectangle } from "@/store/entity/drawable/rectangle/rectangle.ts";
import { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";
import { createEntity } from "@/store/entity/utils.ts";
import { RootStore } from "@/store/rootStore.ts";
import { exhaustiveCheck } from "@/utils/exhaustiveCheck.ts";

const $canvas = document.querySelector("canvas")!;
const ctx = $canvas.getContext("2d")!;
const rootStore = new RootStore();
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

	// mouse down on the edge of selection → start resize
	const edge = selectionStore.getPositionOnEdgeOfSelection(sceneCoordinates);
	if (edge) {
		selectionStore.startResize(edge, sceneCoordinates);
		return;
	}

	// mouse down inside selection box (not on edge) → prepare for move
	const isInsideSelection = selectionStore.isPositionInsideSelection(sceneCoordinates);
	if (isInsideSelection) {
		// shift + mousedown inside selection on specific drawable → remove from selection
		if (e.shiftKey && drawableUnderCursor && selectionStore.drawables.includes(drawableUnderCursor)) {
			selectionStore.delete(drawableUnderCursor);
			return;
		}
		// Start move operation (keep hover active)
		selectionStore.startMove();
		return;
	}

	if (!e.shiftKey) {
		selectionStore.drawables = [];
	}

	// mouse down on not selected entity
	if (drawableUnderCursor) {
		selectionStore.add(drawableUnderCursor);
		// Keep hover active and start move operation immediately
		selectionStore.startMove();
		return;
	}

	// mouse down on empty space + selection tool
	if (sceneStore.tool === SelectionPreview.type) {
		selectionStore.selectionPreview = new SelectionPreview();
		selectionStore.selectionPreview.position = sceneCoordinates;
		selectionStore.selectionPreview.borderWidth /= sceneStore.zoom;
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

	// Update cursor based on position and state
	$canvas.style.cursor = selectionStore.getCursor(sceneCoordinates);

	// Update hover highlight (when not drawing or selecting)
	if (!drawing && !selectionPreview) {
		selectionStore.selectionHover.drawable = drawableStore.getDrawableAtPosition(sceneCoordinates);
	}

	if (!isMainMouseButtonPressed) return;

	// regular drawing
	if (drawing && drawing.position && sceneStore.mouseDown) {
		drawing.position = { ...sceneStore.mouseDown };
		drawing.size = {
			width: sceneCoordinates.x - drawing.position.x,
			height: sceneCoordinates.y - drawing.position.y,
		};
		drawing.normalize();
		return;
	}

	// selection preview
	if (selectionPreview && selectionPreview.position && sceneStore.mouseDown) {
		selectionPreview.position = { ...sceneStore.mouseDown };
		selectionPreview.size = {
			width: sceneCoordinates.x - selectionPreview.position.x,
			height: sceneCoordinates.y - selectionPreview.position.y,
		};
		selectionPreview.normalize();
		return;
	}

	// selection box resize
	if (selectionStore.isResizing) {
		selectionStore.updateResize(sceneCoordinates);
		return;
	}

	// move selected drawables
	if (selectionStore.isMoving) {
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

	// regular drawing finished
	if (drawing) {
		if (drawing.hasSize) {
			drawing.normalize();
			addDrawable(drawing);
		}
		drawableStore.drawing = null;
		sceneStore.mouseDown = null;
		return;
	}

	// selection preview finished
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

	// selection box resize finished
	if (selectionStore.isResizing) {
		selectionStore.endResize();
		return;
	}

	// move finished
	if (selectionStore.isMoving) {
		// Check if it was a click (no mouse movement) on a specific drawable
		const wasClick =
			sceneStore.mouseDown &&
			sceneCoordinates.x === sceneStore.mouseDown.x &&
			sceneCoordinates.y === sceneStore.mouseDown.y;

		if (wasClick && !e.shiftKey && selectionStore.drawables.length > 1) {
			// Click on one drawable from group → select only that one
			const drawableUnderCursor = drawableStore.getDrawableAtPosition(sceneCoordinates);
			if (drawableUnderCursor && selectionStore.drawables.includes(drawableUnderCursor)) {
				selectionStore.drawables = [drawableUnderCursor];
			}
		}

		selectionStore.endMove();
		sceneStore.mouseDown = null;
		return;
	}

	sceneStore.mouseDown = null;
});

document.addEventListener("keydown", e => {
	switch (e.code) {
		case "Escape":
			selectionStore.drawables = [];
			break;
		case "Backspace":
		case "Delete":
			drawableStore.deleteDrawables(selectionStore.drawables);
			selectionStore.drawables = [];
			selectionStore.selectionHover.drawable = null;
			break;
		case "ArrowRight":
		case "ArrowLeft":
		case "ArrowUp":
		case "ArrowDown": {
			let dx = 0;
			let dy = 0;
			const translateStep = sceneStore.getKeyTranslateStep(e);
			switch (e.code) {
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
					exhaustiveCheck(e.code);
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
		case "KeyR": // Physical R key (works in any layout: EN, RU, etc.)
			sceneStore.tool = Rectangle.type;
			break;
		case "KeyE": // Physical E key
			sceneStore.tool = Ellipse.type;
			break;
		case "KeyS": // Physical S key
			sceneStore.tool = SelectionPreview.type;
			break;
		case "Equal": // + key (on main keyboard)
		case "NumpadAdd": // + on numpad
			sceneStore.zoom = sceneStore.zoom * sceneStore.zoomFactor;
			break;
		case "Minus": // - key (on main keyboard)
		case "NumpadSubtract": // - on numpad
			sceneStore.zoom = sceneStore.zoom / sceneStore.zoomFactor;
			break;
		case "Digit0": // 0 key for reset zoom
			if (e.metaKey || e.ctrlKey) {
				// Cmd+0 or Ctrl+0 to reset zoom
				sceneStore.zoom = 1;
			}
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
			selectionStore.zoom = sceneStore.zoom;
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
