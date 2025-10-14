export class Storage<T> {
	private key: string;

	constructor(key: string) {
		this.key = key;
	}

	save(data: T): void {
		try {
			const serialized = JSON.stringify(data);
			localStorage.setItem(this.key, serialized);
		} catch (error) {
			console.error(`Failed to save to localStorage (key: ${this.key}):`, error);
		}
	}

	load(): T | null {
		try {
			const serialized = localStorage.getItem(this.key);
			if (serialized === null) {
				return null;
			}
			return JSON.parse(serialized);
		} catch (error) {
			console.error(`Failed to load from localStorage (key: ${this.key}):`, error);
			return null;
		}
	}
}
