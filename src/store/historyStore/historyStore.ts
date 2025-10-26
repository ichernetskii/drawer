import type { Drawable, DrawableStorable } from "@/domain/entity/drawable/Drawable.ts";
import { createDrawable } from "@/infrastructure/factories/EntityFactory.ts";

type Snapshot = DrawableStorable[];

export class HistoryStore {
	private readonly history: Snapshot[] = [];
	private currentIndex = -1;
	private readonly limit = 100;

	push(drawables: Drawable[]) {
		// Serialize drawables using their toStorable() method
		const snapshot: Snapshot = drawables.map(drawable => drawable.toStorable());

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
		// Deserialize drawables using their fromStorable() method
		return snapshot.map(data => {
			const drawable = createDrawable(data.type);
			drawable.fromStorable(data);
			return drawable;
		});
	}
}
