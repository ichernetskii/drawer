import type { IClonable } from "@domain/interfaces/IClonable.d.ts";

abstract class Position {
	x: number;
	y: number;

	constructor();
	constructor(x: number, y: number);
	constructor(x: number = 0, y: number = 0) {
		this.x = x;
		this.y = y;
	}
}

export class ClientPosition extends Position {}

export class ScenePosition extends Position implements IClonable {
	clone(): ScenePosition {
		return new ScenePosition(this.x, this.y);
	}
}
