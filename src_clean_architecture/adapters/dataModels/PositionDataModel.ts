import type { ToPlainObject } from "@adapters/dataModels/ToPlainObject";
import { Position } from "@domain";

export type IPositionDataModel = ToPlainObject<Position>;

export function positionToDataModel(position: Position): IPositionDataModel {
	return {
		x: position.x,
		y: position.y,
	};
}

export function dataModelToPosition(dataModel: IPositionDataModel): Position {
	return new Position(dataModel.x, dataModel.y);
}
