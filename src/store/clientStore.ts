import { makeAutoObservable } from "mobx";

export class ClientStore {
	constructor() {
		makeAutoObservable(
			this,
			{},
			{
				autoBind: true,
			},
		);
	}

	get dpr() {
		return window.devicePixelRatio || 1;
	}
}
