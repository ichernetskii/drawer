import type { ToPlainObject } from "@adapters/dataModels/ToPlainObject.d.ts";
import { ClientSize } from "@domain";

export type ISizeDataModel = ToPlainObject<ClientSize>;

export function sizeToDataModel(size: ClientSize): ISizeDataModel {
	return {
		width: size.width,
		height: size.height,
	};
}

export function dataModelToSize(dataModel: ISizeDataModel): ClientSize {
	return new ClientSize(dataModel.width, dataModel.height);
}
