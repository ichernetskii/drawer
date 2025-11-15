import { EntityViewModel } from "@adapters/viewModels/EntityViewModel.ts";
import type { Rectangle } from "@domain";

export class RectangleViewModel extends EntityViewModel {
	constructor(rectangle: Rectangle) {
		super(rectangle);
	}
}
