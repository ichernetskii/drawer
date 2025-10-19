import type { Position } from "@/shared/types/types";
import { createEntity } from "@/store/entity/utils.ts";
import type { RootStore } from "@/store/rootStore.ts";

/**
 * Handles drawing operations for creating new shapes.
 * Manages the lifecycle of drawing: start, update, finish.
 */
export class DrawingOperation {
	private readonly rootStore: RootStore;

	constructor(rootStore: RootStore) {
		this.rootStore = rootStore;
	}

	/**
	 * Starts drawing a new entity at the given position.
	 * Creates an entity based on the currently selected tool.
	 */
	start(sceneCoordinates: Position) {
		const entity = createEntity(this.rootStore.sceneStore.tool);
		if (!entity) return;

		entity.position = sceneCoordinates;
		this.rootStore.drawableStore.drawing = entity;
		this.rootStore.sceneStore.mouseDown = sceneCoordinates;
	}

	/**
	 * Updates the drawing entity as the mouse moves.
	 * Calculates size based on the initial mouse down position.
	 * If shiftKey is pressed, maintains 1:1 aspect ratio.
	 */
	update(sceneCoordinates: Position, shiftKey: boolean = false) {
		const { drawing } = this.rootStore.drawableStore;
		const { mouseDown } = this.rootStore.sceneStore;

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
		const { drawing } = this.rootStore.drawableStore;

		if (drawing && drawing.hasSize) {
			drawing.normalize();
			this.rootStore.historyStore.push(this.rootStore.drawableStore.drawables);
			this.rootStore.drawableStore.addDrawable(drawing);
		}

		this.rootStore.drawableStore.drawing = null;
		this.rootStore.sceneStore.mouseDown = null;
	}

	/**
	 * Checks if a drawing operation is currently in progress.
	 */
	isDrawing(): boolean {
		return this.rootStore.drawableStore.drawing !== null;
	}
}
