import "@/styles/style.css";

import { SceneRenderer } from "@/renderer/scene.ts";
import { rootStore } from "@/store/root.ts";
import { createEntity } from "@/store/shapes/entities/createEntity.ts";
import { type EntityType } from "@/store/shapes/entities/entity.ts";
import { exhaustiveCheck } from "@/utils/exhaustiveCheck.ts";

const $canvas = document.querySelector("canvas")!;
const ctx = $canvas.getContext("2d")!;
const { shapesStore, sceneStore, clientStore } = rootStore;
const renderer = new SceneRenderer(ctx, rootStore);

renderer.render();

window.addEventListener("resize", () => {
	renderer.render();
});

$canvas.addEventListener("mousedown", e => {
	const sceneCoordinates = sceneStore.getSceneCoordinates(e);
	const entityUnderCursor = shapesStore.getEntityUnderCursor(sceneCoordinates);
	const isDoubleClick =
		!clientStore.mouseDown || clientStore.mouseDown.x !== e.x || clientStore.mouseDown.y !== e.y
			? false
			: e.timeStamp - clientStore.mouseDown.timeStamp < clientStore.doubleClickTimeout;
	clientStore.mouseDown = e;

	if (isDoubleClick && entityUnderCursor) {
		// ... TODO: set entity to "edit mode" (or create sceneStore.edited: Entity)
		shapesStore.unselectEntities();
		entityUnderCursor.isSelected = true; // TODO: maybe move selected to sceneStore.selected: Entity[] (?)
		return;
	}

	if (entityUnderCursor) {
		if (entityUnderCursor.isSelected) {
			if (e.shiftKey) {
				// shift + mousedown on already selected → clear selection
				entityUnderCursor.isSelected = false;
			}
			return;
		} else {
			if (!e.shiftKey) {
				shapesStore.unselectEntities();
			}
			entityUnderCursor.isSelected = true;
		}
	} else {
		shapesStore.unselectEntities();
		const type: EntityType = "ellipse";
		const entity = createEntity(type);
		entity.position = sceneCoordinates;
		shapesStore.drawingEntity = entity;
	}
});

$canvas.addEventListener("mousemove", e => {
	const { drawingEntity } = shapesStore;
	const isMainMouseButtonPressed = e.buttons === 1;
	const sceneCoordinates = sceneStore.getSceneCoordinates(e);

	if (drawingEntity) {
		if (drawingEntity && drawingEntity.position && isMainMouseButtonPressed) {
			drawingEntity.size = {
				width: sceneCoordinates.x - drawingEntity.position.x,
				height: sceneCoordinates.y - drawingEntity.position.y,
			};
		}
	} else {
		// drag selected entities
		if (isMainMouseButtonPressed && shapesStore.hasSelected()) {
			shapesStore.getSelected().forEach(entity => {
				if (entity.position) {
					entity.position = {
						x: entity.position.x + e.movementX / sceneStore.zoom,
						y: entity.position.y - e.movementY / sceneStore.zoom,
					};
				}
			});
		}
	}
});

$canvas.addEventListener("mouseup", e => {
	const { drawingEntity, addEntity } = shapesStore;

	if (drawingEntity) {
		if (drawingEntity.hasSize) {
			drawingEntity.normalize();
			addEntity(drawingEntity);
		}
		shapesStore.drawingEntity = null;
	} else {
		// click on one entity from an already selected group → select only that one
		if (
			clientStore.mouseDown &&
			e.x === clientStore.mouseDown.x &&
			e.y === clientStore.mouseDown.y &&
			!e.shiftKey
		) {
			const sceneCoordinates = sceneStore.getSceneCoordinates(e);
			const entityUnderCursor = shapesStore.getEntityUnderCursor(sceneCoordinates);
			shapesStore.unselectEntities();
			if (entityUnderCursor) {
				entityUnderCursor.isSelected = true;
			}
			clientStore.mouseDown = null;
		}
	}
});

document.addEventListener("keydown", e => {
	switch (e.key) {
		case "Escape":
			shapesStore.unselectEntities();
			break;
		case "Backspace":
		case "Delete":
			shapesStore.deleteSelected();
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
			if (shapesStore.hasSelected()) {
				shapesStore.getSelected().forEach(entity => {
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
