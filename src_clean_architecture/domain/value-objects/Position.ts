import type { IClonable } from "@domain/interfaces/IClonable.d.ts";

export class Position implements IClonable {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	clone(): Position {
		return new Position(this.x, this.y);
	}

	moveBy(x: number, y: number): Position {
		return new Position(this.x + x, this.y + y);
	}
}
