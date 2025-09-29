import { exhaustiveCheck } from "@/utils/exhaustiveCheck.ts";

import { Ellipse } from "./ellipse.ts";
import type { EntityType } from "./entity.ts";
import { Rectangle } from "./rectangle.ts";

export function createEntity(type: EntityType) {
	switch (type) {
		case "rectangle":
			return new Rectangle();
		case "ellipse":
			return new Ellipse();
		default:
			exhaustiveCheck(type);
	}
}
