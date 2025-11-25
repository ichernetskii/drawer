import type { Ellipse, Position, Rectangle, Size, Text } from "@domain";

export type Tool = typeof Rectangle.type | typeof Ellipse.type | typeof Text.type;

export interface ISceneRepository {
	// Queries
	readonly zoom: number;
	readonly origin: Position;
	readonly size: Size;
	readonly tool: Tool;

	// Commands
	setZoom(zoom: number): void;
	setOrigin(origin: Position): void;
	setSize(size: Size): void;
	setTool(tool: Tool): void;
}
