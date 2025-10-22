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

type Widen<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T;

export type PickFields<T, Fields extends keyof T> = {
	[Key in Extract<keyof T, Fields>]: Widen<T[Key]>;
};
