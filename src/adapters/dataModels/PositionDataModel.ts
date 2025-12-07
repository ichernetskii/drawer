import type { ToPlainObject } from "@adapters/dataModels/ToPlainObject";
import { ScenePosition } from "@domain";

export type IPositionDataModel = ToPlainObject<ScenePosition>;

export function positionToDataModel(position: ScenePosition): IPositionDataModel {
	return {
		x: position.x,
		y: position.y,
	};
}

export function dataModelToPosition(dataModel: IPositionDataModel): ScenePosition {
	return new ScenePosition(dataModel.x, dataModel.y);
}
