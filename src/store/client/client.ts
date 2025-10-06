import { makeAutoObservable } from "mobx";

import type { Position } from "@/types/types";

export class ClientStore {
	private _mouseDown: (Position & { timeStamp: number }) | null = null;
	readonly doubleClickTimeout = 50; // ms

	constructor() {
		makeAutoObservable(
			this,
			{},
			{
				autoBind: true,
			},
		);
	}

	get mouseDown() {
		return this._mouseDown;
	}

	set mouseDown(mouseDown) {
		this._mouseDown = mouseDown;
	}

	get dpr() {
		return window.devicePixelRatio || 1;
	}
}
