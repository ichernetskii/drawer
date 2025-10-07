import { Entity } from "@/store/entities/entity.ts";
import { isSelection, Selection } from "@/store/entities/selection.ts";
import { exhaustiveCheck } from "@/utils/exhaustiveCheck.ts";

import { Ellipse, isEllipse } from "./ellipse.ts";
import { isRectangle, Rectangle } from "./rectangle.ts";

export type EntityType = "rectangle" | "ellipse" | "selection";

export function getEntityType(entity: Entity): EntityType {
	if (isRectangle(entity)) return "rectangle";
	else if (isEllipse(entity)) return "ellipse";
	else if (isSelection(entity)) return "selection";
	else exhaustiveCheck(entity);
}

export function createEntity(type: EntityType) {
	switch (type) {
		case "rectangle":
			return new Rectangle();
		case "ellipse":
			return new Ellipse();
		case "selection":
			return new Selection();
		default:
			exhaustiveCheck(type);
	}
}
