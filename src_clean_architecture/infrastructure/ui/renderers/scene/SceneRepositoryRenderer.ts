import { type ISceneRepository } from "@adapters";

export class SceneRepositoryRenderer {
	ctx: CanvasRenderingContext2D;
	sceneRepository: ISceneRepository;

	constructor(ctx: CanvasRenderingContext2D, sceneRepository: ISceneRepository) {
		this.ctx = ctx;
		this.sceneRepository = sceneRepository;
	}

	render() {
		// TODO
	}
}
