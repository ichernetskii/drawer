import { Scene, ScenePosition, SceneSize } from "@domain";

import type { ToPlainObject } from "./ToPlainObject.d.ts";

export type ISceneDataModel = ToPlainObject<Scene>;

export function sceneToDataModel(scene: Scene): ISceneDataModel {
	return {
		origin: scene.origin,
		zoom: scene.zoom,
		size: scene.size,
	};
}

export function dataModelToScene(dataModel: ISceneDataModel): Scene {
	const scene = new Scene(new SceneSize(dataModel.size.width, dataModel.size.height));
	scene.origin = new ScenePosition(dataModel.origin.x, dataModel.origin.y);
	scene.zoom = dataModel.zoom;
	return scene;
}
