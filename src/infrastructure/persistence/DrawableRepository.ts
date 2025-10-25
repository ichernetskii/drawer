import type { Drawable } from "@/domain/entities/drawable/Drawable";
import { createDrawable } from "@/infrastructure/factories/EntityFactory";
import { LocalStorageAdapter } from "@/infrastructure/storage/LocalStorageAdapter";

interface DrawableData {
	type: string;
	position: { x: number; y: number } | null;
	size: { width: number; height: number } | null;
	color: string;
	borderWidth: number;
}

interface DrawableRepositoryData {
	drawables: DrawableData[];
}

export class DrawableRepository {
	private storage = new LocalStorageAdapter<DrawableRepositoryData>("drawableStore");

	save(drawables: Drawable[]): void {
		const serializedDrawables = drawables.map(drawable => ({
			type: drawable.type,
			position: drawable.position,
			size: drawable.size,
			color: drawable.color,
			borderWidth: drawable.borderWidth,
		}));
		this.storage.save({ drawables: serializedDrawables });
	}

	load(): Drawable[] {
		const data = this.storage.load();
		if (!data) return [];

		const restoredDrawables: Drawable[] = [];

		for (const serialized of data.drawables) {
			const drawable = createDrawable(serialized.type);
			drawable.setPosition(serialized.position);
			drawable.setSize(serialized.size);
			drawable.setColor(serialized.color);
			drawable.setBorderWidth(serialized.borderWidth);
			restoredDrawables.push(drawable);
		}

		return restoredDrawables;
	}
}
