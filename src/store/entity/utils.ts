import type { Drawable } from "@/store/entity/drawable/drawable.ts";

import { Ellipse } from "./drawable/ellipse/ellipse.ts";
import { Rectangle } from "./drawable/rectangle/rectangle.ts";

export function createEntity(type: (typeof Drawable)["type"]): Drawable | null {
	switch (type) {
		case Rectangle.type:
			return new Rectangle();
		case Ellipse.type:
			return new Ellipse();
		default:
			return null;
	}
}
