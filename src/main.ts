import "@/styles/style.css";

import { SceneRenderer } from "@/renderer/scene.ts";
import { rootStore } from "@/store/root.ts";
import { createEntity } from "@/store/shapes/entities/createEntity.ts";
import { type EntityType } from "@/store/shapes/entities/entity.ts";
import { retinaFix } from "@/utils/retinaFix.ts";

const $canvas = document.querySelector("canvas")!;
const ctx = $canvas.getContext("2d")!;
const renderer = new SceneRenderer(ctx, rootStore);

retinaFix(ctx);
renderer.render();

window.addEventListener("resize", () => {
	retinaFix(ctx);
	renderer.render();
});

$canvas.addEventListener("mousedown", e => {
	const { getEntityUnderCursor, unselectEntities, setDrawingEntity } = rootStore.shapesStore;

	const entityUnderCursor = getEntityUnderCursor({ x: e.x, y: e.y });

	unselectEntities();
	if (entityUnderCursor) {
		entityUnderCursor.setIsSelected(true);
	} else {
		const type: EntityType = "rectangle";
		const entity = createEntity(type);
		entity.setPosition({ x: e.x, y: e.y });
		setDrawingEntity(entity);
	}
});

$canvas.addEventListener("mousemove", e => {
	const { drawingEntity } = rootStore.shapesStore;
	if (drawingEntity && drawingEntity.position && e.buttons === 1) {
		drawingEntity.setSize({
			width: e.x - drawingEntity.position.x,
			height: e.y - drawingEntity.position.y,
		});
	}
});

$canvas.addEventListener("mouseup", () => {
	const { drawingEntity, addEntity, setDrawingEntity } = rootStore.shapesStore;
	if (drawingEntity && drawingEntity.size?.width && drawingEntity.size?.height) {
		drawingEntity.normalize();
		addEntity(drawingEntity);
	}
	setDrawingEntity(null);
});

document.addEventListener("keydown", e => {
	const { unselectEntities, entities, setEntities } = rootStore.shapesStore;
	switch (e.key) {
		case "Escape":
			unselectEntities();
			break;
		case "Backspace":
		case "Delete":
			setEntities(entities.filter(entity => !entity.isSelected));
			break;
	}
});

$canvas.addEventListener("contextmenu", e => {
	e.preventDefault();
});
