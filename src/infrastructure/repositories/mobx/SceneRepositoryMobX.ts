import { type ClientSize, type ISceneRepository, Scene, type ScenePosition } from "@domain";
import type { IReactiveRepository } from "@infrastructure/repositories/IReactiveRepository";
import { makeObservableAuto } from "@infrastructure/repositories/mobx/makeObservableAuto.ts";
import { comparer, reaction, toJS } from "mobx";

export class SceneRepositoryMobX implements ISceneRepository, IReactiveRepository {
	private _scene: Scene;

	constructor(size: ClientSize) {
		this._scene = new Scene(size);
		makeObservableAuto(this);
	}

	// Queries
	get scene() {
		return this._scene;
	}

	get zoom() {
		return this._scene.zoom;
	}

	get origin() {
		return this._scene.origin;
	}

	get size() {
		return this._scene.size;
	}

	// Commands
	setZoom(zoom: number): void {
		this._scene.zoom = zoom;
	}

	setOrigin(origin: ScenePosition): void {
		this._scene.origin = origin;
	}

	setSize(size: ClientSize): void {
		this._scene.size = size;
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
