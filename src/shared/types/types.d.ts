export interface Position {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

export interface Storable {
	save(): void;
	load(): void;
}

export interface Disposable {
	dispose: () => void;
}
