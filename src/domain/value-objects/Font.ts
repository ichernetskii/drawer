import type { IClonable } from "@domain/interfaces/IClonable.d.ts";

type FontFamily = "Arial" | "Tahoma";

export class Font implements IClonable {
	size: number;
	family: FontFamily;

	constructor();
	constructor(size: number, family: FontFamily);
	constructor(size: number = 10, family: FontFamily = "Arial") {
		this.size = size;
		this.family = family;
	}

	toString(): string {
		return `${this.size}px ${this.family}`;
	}

	clone(): Font {
		return new Font(this.size, this.family);
	}
}
