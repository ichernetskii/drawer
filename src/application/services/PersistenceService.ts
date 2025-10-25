import { reaction } from "mobx";

import type { Drawable } from "@/domain/entities/drawable/Drawable.ts";
import { createDrawable } from "@/infrastructure/factories/EntityFactory.ts";
import { LocalStorageAdapter } from "@/infrastructure/storage/LocalStorageAdapter.ts";
import type { Disposable } from "@/shared/types/types";
import { debounce } from "@/shared/utils/debounce";
import type { DrawableStore } from "@/store/drawableStore/drawableStore";
import type { SceneStore } from "@/store/sceneStore/sceneStore";
import type { SelectionStore } from "@/store/selectionStore/selectionStore";

type DrawableStorableKeys = Extract<keyof Drawable, "type" | "position" | "size" | "color" | "borderWidth">;

export type DrawableStoreStorable = {
	[Key in Extract<keyof DrawableStore, "drawables">]: Pick<Drawable, DrawableStorableKeys>[];
};

export type SceneStoreStorable = Pick<SceneStore, "tool" | "origin" | "zoom">;

/**
 * PersistenceService handles automatic saving of store state to repositories.
 * Separates persistence concerns from business logic in stores.
 */
export class PersistenceService implements Disposable {
	private disposables: Array<() => void> = [];
	private drawableStore: DrawableStore;
	private sceneStore: SceneStore;
	private selectionStore: SelectionStore;
	private drawableStorage: LocalStorageAdapter<DrawableStoreStorable>;
	private sceneStorage: LocalStorageAdapter<SceneStoreStorable>;

	constructor(
		drawableStore: DrawableStore, // TODO → rootStore
		sceneStore: SceneStore,
		selectionStore: SelectionStore,
		drawableStorage: LocalStorageAdapter<DrawableStoreStorable>,
		sceneStorage: LocalStorageAdapter<SceneStoreStorable>,
	) {
		this.drawableStore = drawableStore;
		this.sceneStore = sceneStore;
		this.selectionStore = selectionStore;
		this.drawableStorage = drawableStorage;
		this.sceneStorage = sceneStorage;
		this.setupAutoSave();
	}

	load() {
		const sceneStoreStorable = this.sceneStorage.load();
		if (sceneStoreStorable) {
			const { zoom, tool, origin } = sceneStoreStorable;
			this.sceneStore.zoom = zoom;
			this.sceneStore.origin = origin;
			this.sceneStore.tool = tool;
		}

		const drawableStoreStorable = this.drawableStorage.load();
		if (drawableStoreStorable) {
			const restoredDrawables: Drawable[] = [];

			for (const serialized of drawableStoreStorable.drawables) {
				const drawable = createDrawable(serialized.type);
				drawable.setPosition(serialized.position); // TODO: get rid of action ???
				drawable.setSize(serialized.size);
				drawable.setColor(serialized.color);
				drawable.setBorderWidth(serialized.borderWidth);
				restoredDrawables.push(drawable);
			}

			this.drawableStore.drawables = restoredDrawables;
		}
	}

	private setupAutoSave() {
		// Auto-save drawables when they change
		const saveDrawables = debounce(() => {
			const drawableStoreStorable: DrawableStoreStorable = {
				drawables: this.drawableStore.drawables.map(drawable => ({
					type: drawable.type,
					position: drawable.position,
					size: drawable.size,
					color: drawable.color,
					borderWidth: drawable.borderWidth,
				})),
			};
			this.drawableStorage.save(drawableStoreStorable);
		}, 1000);

		this.disposables.push(
			reaction(
				() =>
					this.drawableStore.drawables.map(drawable => [
						drawable.position,
						drawable.size,
						drawable.color,
						drawable.borderWidth,
					]),
				() => saveDrawables(),
			),
		);

		// Auto-save scene when zoom, origin, or tool changes
		const saveScene = debounce(() => {
			this.sceneStorage.save({
				zoom: this.sceneStore.zoom,
				origin: this.sceneStore.origin,
				tool: this.sceneStore.tool,
			});
		}, 1000);

		this.disposables.push(
			reaction(
				() => [this.sceneStore.zoom, this.sceneStore.origin, this.sceneStore.tool],
				() => saveScene(),
			),
		);

		// Sync zoom changes to selection store
		this.disposables.push(
			// TODO: → move from this file
			reaction(
				() => this.sceneStore.zoom,
				zoom => {
					this.selectionStore.zoom = zoom;
					this.selectionStore.selectionHover.setZoom(zoom);
				},
			),
		);
	}

	dispose() {
		this.disposables.forEach(dispose => dispose());
		this.disposables = [];
	}
}
