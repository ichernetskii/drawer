import "@/styles/style.css";

import { SceneRenderer } from "@/renderer/scene.ts";
import { rootStore } from "@/store/root.ts";
import { createEntity } from "@/store/shapes/entities/createEntity.ts";
import { type EntityType } from "@/store/shapes/entities/entity.ts";

const $canvas = document.querySelector("canvas")!;
const ctx = $canvas.getContext("2d")!;
const { shapesStore, sceneStore } = rootStore;
const renderer = new SceneRenderer(ctx, rootStore);

renderer.render();

window.addEventListener("resize", () => {
	renderer.render();
});

$canvas.addEventListener("mousedown", e => {
	const sceneCoordinates = sceneStore.getSceneCoordinates(e);
	const entityUnderCursor = shapesStore.getEntityUnderCursor(sceneCoordinates);

	shapesStore.unselectEntities();
	if (entityUnderCursor) {
		entityUnderCursor.isSelected = true;
	} else {
		const type: EntityType = "rectangle";
		const entity = createEntity(type);
		entity.position = sceneCoordinates;
		shapesStore.setDrawingEntity(entity);
	}
});

$canvas.addEventListener("mousemove", e => {
	const { drawingEntity } = shapesStore;
	if (drawingEntity && drawingEntity.position && e.buttons === 1) {
		const sceneCoordinates = sceneStore.getSceneCoordinates(e);
		drawingEntity.size = {
			width: sceneCoordinates.x - drawingEntity.position.x,
			height: sceneCoordinates.y - drawingEntity.position.y,
		};
	}
});

$canvas.addEventListener("mouseup", () => {
	const { drawingEntity, addEntity, setDrawingEntity } = shapesStore;
	if (drawingEntity && drawingEntity.size?.width && drawingEntity.size?.height) {
		drawingEntity.normalize();
		addEntity(drawingEntity);
	}
	setDrawingEntity(null);
});

document.addEventListener("keydown", e => {
	const { unselectEntities, entities, setEntities } = shapesStore;
	const { panBy } = sceneStore;

	const shiftMultiplier = 10;
	const baseSceneShift = 5;
	const sceneShift = e.shiftKey ? shiftMultiplier * baseSceneShift : baseSceneShift;
	const zoomFactor = 1.2;

	switch (e.key) {
		case "Escape":
			unselectEntities();
			break;
		case "Backspace":
		case "Delete":
			setEntities(entities.filter(entity => !entity.isSelected));
			break;
		case "ArrowRight":
			panBy({ x: sceneShift, y: 0 });
			break;
		case "ArrowLeft":
			panBy({ x: -sceneShift, y: 0 });
			break;
		case "ArrowUp":
			panBy({ x: 0, y: sceneShift });
			break;
		case "ArrowDown":
			panBy({ x: 0, y: -sceneShift });
			break;
		case "+":
			sceneStore.zoom = sceneStore.zoom * zoomFactor;
			break;
		case "-":
			sceneStore.zoom = sceneStore.zoom / zoomFactor;
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
		// prevent page scroll/zoom
		e.preventDefault();

		const { panBy, zoom } = sceneStore;

		// Zoom: Cmd (mac) or Ctrl (pc) + wheel; also covers pinch on many touchpads (ctrlKey=true)
		if (e.metaKey || e.ctrlKey) {
			// Heuristic: increase sensitivity for touchpad-like fine-grained deltas
			const isPixel = e.deltaMode === 0; // WheelEvent.DOM_DELTA_PIXEL
			const isFine = isPixel && Math.abs(e.deltaY) < 50;
			const ZOOM_SENSITIVITY = isFine ? 0.01 : 0.001;
			const factor = Math.exp(-e.deltaY * ZOOM_SENSITIVITY);

			const sceneCoordinates = sceneStore.getSceneCoordinates({ x: e.x, y: e.y });
			sceneStore.zoom = factor * zoom;

			const cx = e.x - sceneStore.size.width / 2;
			const cy = e.y - sceneStore.size.height / 2;
			const newOriginX = sceneCoordinates.x - cx / sceneStore.zoom;
			const newOriginY = sceneCoordinates.y + cy / sceneStore.zoom;

			sceneStore.origin = { x: newOriginX, y: newOriginY };
			return;
		}

		// Pan: Shift + wheel → horizontal from vertical delta
		if (e.shiftKey) {
			panBy({ x: e.deltaY / zoom, y: 0 });
			return;
		}

		// Trackpad two-finger pan (both axes) or mouse wheel (vertical only)
		const dx = e.deltaX;
		const dy = -e.deltaY;
		panBy({ x: dx / zoom, y: dy / zoom });
	},
	{ passive: false },
);
