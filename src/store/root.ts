import { Shapes } from "./shapes/shapes.ts";

export class RootStore {
	readonly shapesStore = new Shapes();
	constructor() {}
}

export const rootStore = new RootStore();
