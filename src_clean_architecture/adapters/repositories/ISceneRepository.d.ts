import type { Ellipse, Position, Rectangle, Size } from "@domain";

type Tool = typeof Rectangle.type | typeof Ellipse.type;

export interface ISceneRepository {
	zoom: number;
	origin: Position;
	size: Size;
	tool: Tool;

	setZoom(zoom: number): void;
	setOrigin(origin: Position): void;
	setSize(size: Size): void;
	setTool(tool: Tool): void;
}
