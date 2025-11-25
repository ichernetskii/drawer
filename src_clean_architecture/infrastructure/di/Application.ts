import { entityFactory, MouseController } from "@adapters";
import { Size } from "@domain";
import { EntityRepositoryRedux } from "@infrastructure/repositories/redux/EntityRepositoryRedux.ts";
import { SceneRepositoryRedux } from "@infrastructure/repositories/redux/SceneRepositoryRedux.ts";
import { entityStoreAdapterRedux, sceneStoreAdapterRedux } from "@infrastructure/repositories/redux/store/store.ts";
import { CanvasEventHandler } from "@infrastructure/ui/eventHandlers/CanvasEventHandler.ts";
import { SceneRenderer } from "@infrastructure/ui/renderers/SceneRenderer.ts";
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
		// const sceneRepository = new SceneRepositoryMobX(new Size($canvas.clientWidth, $canvas.clientHeight));
		const sceneRepository = new SceneRepositoryRedux(
			new Size($canvas.clientWidth, $canvas.clientHeight),
			sceneStoreAdapterRedux,
		);

		const drawEntityUseCase = new DrawEntityUseCase(entityRepository, entityFactory);

		const mouseController = new MouseController(sceneRepository, drawEntityUseCase);
		const sceneRenderer = new SceneRenderer(ctx, entityRepository, sceneRepository);
		const canvasEventHandler = new CanvasEventHandler($canvas, mouseController);

		this.disposeBag = [
			canvasEventHandler.subscribe(),
			entityRepository.subscribe(() => {
				sceneRenderer.render();
			}),
			sceneRepository.subscribe(() => {
				sceneRenderer.render();
			}),
		];
	}

	dispose() {
		this.disposeBag.forEach(dispose => dispose());
	}
}
