import { makeAutoObservable } from "mobx";

export class ClientStore {
	constructor() {
		makeAutoObservable(this);
	}

	get dpr() {
		return window.devicePixelRatio || 1;
	}
}
