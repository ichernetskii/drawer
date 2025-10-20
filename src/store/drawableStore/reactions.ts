import { reaction } from "mobx";

import type { DrawableStore } from "@/store/drawableStore/drawableStore.ts";

export function handleChangeDrawables(drawableStore: DrawableStore) {
	return reaction(
		() =>
			drawableStore.drawables.map(drawable => [
				drawable.position,
				drawable.size,
				drawable.color,
				drawable.borderWidth,
			]),
		() => drawableStore.save(),
	);
}
