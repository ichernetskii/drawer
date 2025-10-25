import { LocalStorageAdapter } from "@/infrastructure/storage/LocalStorageAdapter";
import type { Position } from "@/shared/types/types";

export interface SceneData {
	zoom: number;
	origin: Position;
	tool: string;
}

export class SceneRepository {
	private storage = new LocalStorageAdapter<SceneData>("sceneStore");

	save(data: SceneData): void {
		this.storage.save(data);
	}

	load(): SceneData | null {
		return this.storage.load();
	}
}
