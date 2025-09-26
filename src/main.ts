import "./styles/style.css";

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
	const { setDrawingEntity } = rootStore.shapesStore;
	const type: EntityType = "rectangle";
	const entity = createEntity(type);
	entity.position = { x: e.x, y: e.y };
	setDrawingEntity(entity);
});

$canvas.addEventListener("contextmenu", e => {
	e.preventDefault();
});

$canvas.addEventListener("mousemove", e => {
	const { drawingEntity } = rootStore.shapesStore;
	if (drawingEntity && drawingEntity.position && e.buttons === 1) {
		drawingEntity.size = {
			width: e.x - drawingEntity.position.x,
			height: e.y - drawingEntity.position.y,
		};
	}
});

$canvas.addEventListener("mouseup", () => {
	const { drawingEntity, addEntity, resetDrawingEntity } = rootStore.shapesStore;
	if (drawingEntity) {
		addEntity(drawingEntity);
		resetDrawingEntity();
	}
});
