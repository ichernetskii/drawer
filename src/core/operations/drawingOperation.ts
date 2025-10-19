import type { Position } from "@/shared/types/types";
import type { DrawableStore } from "@/store/drawableStore/drawableStore.ts";
import { createEntity } from "@/store/entity/utils.ts";
import type { HistoryStore } from "@/store/historyStore/historyStore.ts";
import type { SceneStore } from "@/store/sceneStore/sceneStore.ts";

/**
 * Handles drawing operations for creating new shapes.
 * Manages the lifecycle of drawing: start, update, finish.
 */
export class DrawingOperation {
	private readonly drawableStore: DrawableStore;
	private readonly sceneStore: SceneStore;
	private readonly historyStore: HistoryStore;

	constructor(drawableStore: DrawableStore, sceneStore: SceneStore, historyStore: HistoryStore) {
		this.sceneStore = sceneStore;
		this.drawableStore = drawableStore;
		this.historyStore = historyStore;
	}

	/**
	 * Starts drawing a new entity at the given position.
	 * Creates an entity based on the currently selected tool.
	 */
	start(sceneCoordinates: Position) {
		const entity = createEntity(this.sceneStore.tool);
		if (!entity) return;

		entity.position = sceneCoordinates;
		this.drawableStore.drawing = entity;
		this.sceneStore.mouseDown = sceneCoordinates;
	}

	/**
	 * Updates the drawing entity as the mouse moves.
	 * Calculates size based on the initial mouse down position.
	 * If shiftKey is pressed, maintains 1:1 aspect ratio.
	 */
	update(sceneCoordinates: Position, shiftKey: boolean = false) {
		const { drawing } = this.drawableStore;
		const { mouseDown } = this.sceneStore;

		if (!drawing || !drawing.position || !mouseDown) return;

		drawing.position = { ...mouseDown };
		let width = sceneCoordinates.x - drawing.position.x;
		let height = sceneCoordinates.y - drawing.position.y;

		// Maintain 1:1 aspect ratio when Shift is pressed
		if (shiftKey) {
			const maxSide = Math.max(Math.abs(width), Math.abs(height));
			width = Math.sign(width) * maxSide;
			height = Math.sign(height) * maxSide;
		}

		drawing.size = { width, height };
		drawing.normalize();
	}

	/**
	 * Finishes the drawing operation.
	 * Adds the drawable to the store if it has a valid size.
	 */
	finish() {
		const { drawing } = this.drawableStore;

		if (drawing && drawing.hasSize) {
			drawing.normalize();
			this.historyStore.push(this.drawableStore.drawables);
			this.drawableStore.addDrawable(drawing);
		}

		this.drawableStore.drawing = null;
		this.sceneStore.mouseDown = null;
	}

	/**
	 * Checks if a drawing operation is currently in progress.
	 */
	isDrawing(): boolean {
		return this.drawableStore.drawing !== null;
	}
}
