import { computed } from "mobx";

export class ClientStore {
	@computed get dpr() {
		return window.devicePixelRatio || 1;
	}
}
