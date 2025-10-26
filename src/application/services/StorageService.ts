import { reaction } from "mobx";

import type { DrawableStorable } from "@/domain/entity/drawable/Drawable.ts";
import { deserializeDrawables, serializeDrawables } from "@/infrastructure/serialization/drawableSerialization.ts";
import { LocalStorageAdapter } from "@/infrastructure/storage/LocalStorageAdapter.ts";
import type { Disposable } from "@/shared/types/types.d.ts";
import { debounce } from "@/shared/utils/debounce.ts";
import type { DrawableStore } from "@/store/drawableStore/drawableStore.ts";
import type { RootStore } from "@/store/rootStore.ts";
import type { SceneStore } from "@/store/sceneStore/sceneStore.ts";

export type DrawableStoreStorable = {
	[Key in Extract<keyof DrawableStore, "drawables">]: DrawableStorable[];
};

export type SceneStoreStorable = Pick<SceneStore, "tool" | "origin" | "zoom">;

const AUTOSAVE_TIMEOUT = 1000; // ms

/**
 * StorageService handles load and automatic saving of store state.
 */
export class StorageService implements Disposable {
	private rootStore: RootStore;
	private drawableStorage: LocalStorageAdapter<DrawableStoreStorable>;
	private sceneStorage: LocalStorageAdapter<SceneStoreStorable>;
	private readonly disposables: Array<() => void> = [];

	constructor(
		rootStore: RootStore,
		drawableStorage: LocalStorageAdapter<DrawableStoreStorable>,
		sceneStorage: LocalStorageAdapter<SceneStoreStorable>,
	) {
		this.rootStore = rootStore;
		this.drawableStorage = drawableStorage;
		this.sceneStorage = sceneStorage;

		this.disposables = [this.handleChangeDrawables(), this.handleChangeScene()];
	}

	load() {
		const sceneStoreStorable = this.sceneStorage.load();
		if (sceneStoreStorable) {
			const { zoom, tool, origin } = sceneStoreStorable;
			this.rootStore.sceneStore.setZoom(zoom);
			this.rootStore.sceneStore.setOrigin(origin);
			this.rootStore.sceneStore.setTool(tool);
		}

		const drawableStoreStorable = this.drawableStorage.load();
		if (drawableStoreStorable) {
			const restoredDrawables = deserializeDrawables(drawableStoreStorable.drawables);
			this.rootStore.drawableStore.setDrawables(restoredDrawables);
		}
	}

	private saveDrawables = debounce(() => {
		const drawableStoreStorable: DrawableStoreStorable = {
			drawables: serializeDrawables(this.rootStore.drawableStore.drawables),
		};
		this.drawableStorage.save(drawableStoreStorable);
	}, AUTOSAVE_TIMEOUT);

	private saveScene = debounce(() => {
		this.sceneStorage.save({
			zoom: this.rootStore.sceneStore.zoom,
			origin: this.rootStore.sceneStore.origin,
			tool: this.rootStore.sceneStore.tool,
		});
	}, AUTOSAVE_TIMEOUT);

	private handleChangeDrawables() {
		return reaction(
			() =>
				this.rootStore.drawableStore.drawables.map(drawable => [
					drawable.position,
					drawable.size,
					drawable.color,
					drawable.borderWidth,
				]),
			() => this.saveDrawables(),
		);
	}

	private handleChangeScene() {
		return reaction(
			() => [this.rootStore.sceneStore.zoom, this.rootStore.sceneStore.origin, this.rootStore.sceneStore.tool],
			() => this.saveScene(),
		);
	}

	dispose() {
		this.disposables.forEach(dispose => dispose());
		this.disposables.length = 0;
	}
}
