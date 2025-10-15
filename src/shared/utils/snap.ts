export function snapToGrid(value: number, gridStep: number): number {
	return Math.round(value / gridStep) * gridStep;
}

export function snapToGridFloor(value: number, gridStep: number): number {
	return Math.floor(value / gridStep) * gridStep;
}

export function snapToGridCeil(value: number, gridStep: number): number {
	return Math.ceil(value / gridStep) * gridStep;
}
