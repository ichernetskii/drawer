import { ClientSize, Scene, ScenePosition } from "@domain";

export interface ISceneViewModel {
	zoom: number;
	origin: ScenePosition;
	size: ClientSize;
}

export function sceneToViewModel(scene: Scene): ISceneViewModel {
	return {
		origin: scene.origin,
		zoom: scene.zoom,
		size: scene.size,
	};
}
