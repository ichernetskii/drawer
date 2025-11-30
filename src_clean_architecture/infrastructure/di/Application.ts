import { entityFactory, MouseController } from "@adapters";
import { ClientSize } from "@domain";
// import { EntityRepositoryMobX } from "@infrastructure/repositories/mobx/EntityRepositoryMobX.ts";
// import { SceneRepositoryMobX } from "@infrastructure/repositories/mobx/SceneRepositoryMobX.ts";
import { EntityRepositoryRedux } from "@infrastructure/repositories/redux/EntityRepositoryRedux.ts";
import { SceneRepositoryRedux } from "@infrastructure/repositories/redux/SceneRepositoryRedux.ts";
import { entityStoreAdapterRedux, sceneStoreAdapterRedux } from "@infrastructure/repositories/redux/store/store.ts";
import { CanvasEventHandler } from "@infrastructure/ui/eventHandlers/CanvasEventHandler.ts";
import { EntitiesRenderer } from "@infrastructure/ui/renderers/entities/EntitiesRenderer.ts";
import { Renderer } from "@infrastructure/ui/renderers/Renderer.ts";
import { SceneRenderer } from "@infrastructure/ui/renderers/scene/SceneRenderer.ts";
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

		// const entityRepository = new EntityRepositoryMobX();
		const entityRepository = new EntityRepositoryRedux(entityStoreAdapterRedux);
		// const sceneRepository = new SceneRepositoryMobX(new ClientSize($canvas.clientWidth, $canvas.clientHeight));
		const sceneRepository = new SceneRepositoryRedux(
			new ClientSize($canvas.clientWidth, $canvas.clientHeight),
			sceneStoreAdapterRedux,
		);

		const drawEntityUseCase = new DrawEntityUseCase(entityRepository, entityFactory);

		const mouseController = new MouseController(entityRepository, sceneRepository, drawEntityUseCase);

		const entitiesRenderer = new EntitiesRenderer(ctx, entityRepository, sceneRepository.scene);
		const sceneRenderer = new SceneRenderer(ctx, sceneRepository.scene);
		const renderer = new Renderer(ctx, entitiesRenderer, sceneRenderer);

		const canvasEventHandler = new CanvasEventHandler($canvas, mouseController);

		this.disposeBag = [
			canvasEventHandler.subscribe(),
			entityRepository.subscribe(() => {
				renderer.render();
			}),
			sceneRepository.subscribe(() => {
				renderer.render();
			}),
		];
	}

	dispose() {
		this.disposeBag.forEach(dispose => dispose());
	}
}
