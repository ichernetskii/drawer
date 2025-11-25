import type { ToPlainObject } from "@adapters/dataModels/ToPlainObject";
import { Size } from "@domain";

export type ISizeDataModel = ToPlainObject<Size>;

export function sizeToDataModel(size: Size): ISizeDataModel {
	return {
		width: size.width,
		height: size.height,
	};
}

export function dataModelToSize(dataModel: ISizeDataModel): Size {
	return new Size(dataModel.width, dataModel.height);
}
