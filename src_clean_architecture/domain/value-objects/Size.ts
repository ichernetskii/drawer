import type { IClonable } from "@domain/interfaces/IClonable.d.ts";

export class Size implements IClonable {
	width: number;
	height: number;

	constructor();
	constructor(width: number, height: number);
	constructor(width: number = 0, height: number = 0) {
		this.width = width;
		this.height = height;
	}

	clone(): Size {
		return new Size(this.width, this.height);
	}

	scale(factor: number): Size;
	scale(factorX: number, factorY: number): Size;
	scale(factorX: number, factorY?: number): Size {
		return new Size(this.width * factorX, this.height * (factorY ?? factorX));
	}
}
