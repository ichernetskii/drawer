import type { Drawable } from "@/store/entity/drawable/drawable.ts";
import { createEntity } from "@/store/entity/utils.ts";

type StoredDrawable = Pick<Drawable, "position" | "size" | "color" | "borderWidth"> & { type: string };

type Snapshot = StoredDrawable[];

export class HistoryStore {
	private readonly stack: Snapshot[] = [];
	private readonly limit = 100;

	push(drawables: Drawable[]) {
		const snapshot: Snapshot = drawables.map(drawable => ({
			type: (drawable.constructor as typeof Drawable).type,
			position: drawable.position,
			size: drawable.size,
			color: drawable.color,
			borderWidth: drawable.borderWidth,
		}));

		this.stack.push(snapshot);
		if (this.stack.length > this.limit) this.stack.shift();
	}

	get canUndo() {
		return this.stack.length > 0;
	}

	pop(): Drawable[] | null {
		const snapshot = this.stack.pop();
		if (!snapshot) return null;

		const restored: Drawable[] = [];
		for (const drawableSnapshot of snapshot) {
			const drawable = createEntity(drawableSnapshot.type);
			if (drawable) {
				drawable.position = drawableSnapshot.position;
				drawable.size = drawableSnapshot.size;
				drawable.color = drawableSnapshot.color;
				drawable.borderWidth = drawableSnapshot.borderWidth;
				restored.push(drawable);
			}
		}

		return restored;
	}
}
