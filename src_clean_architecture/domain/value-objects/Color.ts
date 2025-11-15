import type { IClonable } from "@domain/interfaces/IClonable.d.ts";

export class Color implements IClonable {
	red: number; // 0..1
	green: number; // 0..1
	blue: number; // 0..1
	alpha: number; // 0..1

	constructor();
	constructor(red: number, green: number, blue: number);
	constructor(red: number, green: number, blue: number, alpha: number);
	constructor(red: number = 0, green: number = 0, blue: number = 0, alpha: number = 1) {
		this.red = red;
		this.green = green;
		this.blue = blue;
		this.alpha = alpha;
	}

	toString(): string {
		const red = Math.round(this.red * 255);
		const green = Math.round(this.green * 255);
		const blue = Math.round(this.blue * 255);
		return `rgba(${red}, ${green}, ${blue}, ${this.alpha})`;
	}

	clone(): Color {
		return new Color(this.red, this.green, this.blue, this.alpha);
	}

	static get Transparent(): Color {
		return new Color(0, 0, 0, 0);
	}

	static get Black(): Color {
		return new Color(0, 0, 0, 1);
	}

	static get White(): Color {
		return new Color(1, 1, 1, 1);
	}
}
