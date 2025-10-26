export interface Position {
	x: number;
	y: number;
}

export interface Size {
	width: number;
	height: number;
}

export interface Disposable {
	dispose: () => void;
}

export type ResizeHandle =
	| "top"
	| "bottom"
	| "left"
	| "right"
	| "top-left"
	| "top-right"
	| "bottom-left"
	| "bottom-right";
