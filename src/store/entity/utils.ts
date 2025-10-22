import { Drawable } from "@/store/entity/drawable/drawable.ts";

import { Ellipse } from "./drawable/ellipse/ellipse.ts";
import { Rectangle } from "./drawable/rectangle/rectangle.ts";

export function createDrawable(type: (typeof Drawable)["type"]) {
	switch (type) {
		case Rectangle.type:
			return new Rectangle();
		case Ellipse.type:
			return new Ellipse();
		default:
			throw new Error(`Unknown drawable type: ${type}`);
	}
}
