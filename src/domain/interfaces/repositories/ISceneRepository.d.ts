import type { ClientSize, Position, Scene } from "@domain";

export interface ISceneRepository {
	// Queries
	readonly scene: Scene;
	readonly zoom: number;
	readonly origin: Position;
	readonly size: ClientSize;

	// Commands
	setZoom(zoom: number): void;
	setOrigin(origin: Position): void;
	setSize(size: ClientSize): void;
}
