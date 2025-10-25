import type { Drawable } from "@/domain/entities/drawable/Drawable.ts";
import { createDrawable } from "@/infrastructure/factories/EntityFactory.ts";

interface DrawableData {
	type: string;
	position: { x: number; y: number } | null;
	size: { width: number; height: number } | null;
	color: string;
	borderWidth: number;
}

type Snapshot = DrawableData[];

export class HistoryStore {
	private readonly history: Snapshot[] = [];
	private currentIndex = -1;
	private readonly limit = 100;

	push(drawables: Drawable[]) {
		const snapshot: Snapshot = drawables.map(drawable => ({
			type: drawable.type,
			position: drawable.position,
			size: drawable.size,
			color: drawable.color,
			borderWidth: drawable.borderWidth,
		}));

		// Remove any history after current index (when new action is performed after undo)
		this.history.length = this.currentIndex + 1;

		// Add new snapshot
		this.history.push(snapshot);
		this.currentIndex++;

		// Limit history size
		if (this.history.length > this.limit) {
			this.history.shift();
			this.currentIndex--;
		}
	}

	undo(): Drawable[] | null {
		if (!this.canUndo) return null;

		return this.restoreSnapshot(this.history[--this.currentIndex]);
	}

	redo(): Drawable[] | null {
		if (!this.canRedo) return null;

		return this.restoreSnapshot(this.history[++this.currentIndex]);
	}

	private get canUndo() {
		return this.currentIndex > 0;
	}

	private get canRedo() {
		return this.currentIndex < this.history.length - 1;
	}

	private restoreSnapshot(snapshot: Snapshot): Drawable[] {
		const restored: Drawable[] = [];
		for (const serialized of snapshot) {
			const drawable = createDrawable(serialized.type);
			drawable.setPosition(serialized.position);
			drawable.setSize(serialized.size);
			drawable.setColor(serialized.color);
			drawable.setBorderWidth(serialized.borderWidth);
			restored.push(drawable);
		}

		return restored;
	}
}
