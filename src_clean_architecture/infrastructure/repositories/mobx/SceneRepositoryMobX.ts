import type { ISceneRepository, Tool } from "@adapters";
import { Position, Rectangle, Size } from "@domain";
import type { IReactiveRepository } from "@infrastructure/repositories/IReactiveRepository";
import { comparer, makeAutoObservable, reaction, toJS } from "mobx";

export class SceneRepositoryMobX implements ISceneRepository, IReactiveRepository {
	_zoom: number = 1;
	_origin: Position = new Position(0, 0);
	_size: Size;
	_tool: Tool = Rectangle.type;

	constructor(size: Size) {
		this._size = size;
		makeAutoObservable(this);
	}

	// Queries
	get zoom() {
		return this._zoom;
	}

	get origin() {
		return this._origin;
	}

	get size() {
		return this._size;
	}

	get tool() {
		return this._tool;
	}

	// Commands
	setZoom(zoom: number): void {
		this._zoom = zoom;
	}

	setOrigin(origin: Position): void {
		this._origin = origin;
	}

	setSize(size: Size): void {
		this._size = size;
	}

	setTool(tool: Tool): void {
		this._tool = tool;
	}

	subscribe(listener: () => void): () => void {
		return reaction(
			() => toJS(this),
			() => {
				listener();
			},
			{
				equals: comparer.structural,
				fireImmediately: true,
			},
		);
	}
}
