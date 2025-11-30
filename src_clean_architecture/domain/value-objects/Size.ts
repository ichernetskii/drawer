import type { IClonable } from "@domain/interfaces/IClonable.d.ts";

abstract class Size {
	width: number;
	height: number;

	constructor();
	constructor(width: number, height: number);
	constructor(width: number = 0, height: number = 0) {
		this.width = width;
		this.height = height;
	}
}

export class ClientSize extends Size {}

export class SceneSize extends Size implements IClonable {
	clone(): SceneSize {
		return new SceneSize(this.width, this.height);
	}
}
