import { entityFactory, MouseController } from "@adapters";
import { Size } from "@domain";
import { EntityRepositoryMobX } from "@infrastructure/repositories/mobx/EntityRepositoryMobX.ts";
import { SceneRepositoryMobX } from "@infrastructure/repositories/mobx/SceneRepositoryMobX.ts";
import { CanvasEventHandler } from "@infrastructure/ui/eventHandlers/CanvasEventHandler.ts";
import { EntityRepositoryRenderer } from "@infrastructure/ui/renderers/entityRepository/EntityRepositoryRenderer.ts";
import { RepositoriesRenderer } from "@infrastructure/ui/renderers/RepositoriesRenderer.ts";
import { SceneRepositoryRenderer } from "@infrastructure/ui/renderers/sceneRepository/SceneRepositoryRenderer.ts";
import { retinaFix } from "@infrastructure/ui/utils/retina-fix.ts";
import { DrawEntityUseCase } from "@use-cases";

export class Application {
	private disposeBag: Array<() => void> = [];

	constructor() {
		const $canvas = document.querySelector("canvas");
		const ctx = $canvas?.getContext("2d");
		if (!$canvas || !ctx) {
			throw new Error("Can't find canvas");
		}

		const dpr = window.devicePixelRatio || 1;
		retinaFix(ctx, dpr);

		const entityRepository = new EntityRepositoryMobX();
		// const entityRepository = new EntityRepositoryRedux(entityStoreAdapterRedux);
		const sceneRepository = new SceneRepositoryMobX(new Size($canvas.clientWidth, $canvas.clientHeight));
		// const sceneRepository = new SceneRepositoryRedux(
		// 	new Size($canvas.clientWidth, $canvas.clientHeight),
		// 	sceneStoreAdapterRedux,
		// );

		const drawEntityUseCase = new DrawEntityUseCase(entityRepository, entityFactory);

		const mouseController = new MouseController(sceneRepository, drawEntityUseCase);

		const entityRepositoryRenderer = new EntityRepositoryRenderer(ctx, entityRepository, sceneRepository);
		const sceneRepositoryRenderer = new SceneRepositoryRenderer(ctx, sceneRepository);
		const repositoriesRenderer = new RepositoriesRenderer(ctx, entityRepositoryRenderer, sceneRepositoryRenderer);

		const canvasEventHandler = new CanvasEventHandler($canvas, mouseController);

		this.disposeBag = [
			canvasEventHandler.subscribe(),
			entityRepository.subscribe(() => {
				repositoriesRenderer.render();
			}),
			sceneRepository.subscribe(() => {
				repositoriesRenderer.render();
			}),
		];
	}

	dispose() {
		this.disposeBag.forEach(dispose => dispose());
	}
}
