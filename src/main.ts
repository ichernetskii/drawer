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
		entityUnderCursor.setIsSelected(true);
	} else {
		const type: EntityType = "rectangle";
		const entity = createEntity(type);
		entity.setPosition(sceneCoordinates);
		shapesStore.setDrawingEntity(entity);
	}
});

$canvas.addEventListener("mousemove", e => {
	const { drawingEntity } = shapesStore;
	if (drawingEntity && drawingEntity.position && e.buttons === 1) {
		const sceneCoordinates = sceneStore.getSceneCoordinates(e);
		drawingEntity.setSize({
			width: sceneCoordinates.x - drawingEntity.position.x,
			height: sceneCoordinates.y - drawingEntity.position.y,
		});
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
	const { panBy, setZoom } = sceneStore;

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
			setZoom(sceneStore.zoom * zoomFactor);
			break;
		case "-":
			setZoom(sceneStore.zoom / zoomFactor);
			break;
		case "=":
			setZoom(1);
			break;
	}
});

$canvas.addEventListener("contextmenu", e => {
	e.preventDefault();
});
