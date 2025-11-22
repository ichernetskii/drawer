import { MouseController } from "@adapters";
import { Size } from "@domain";
import { EntityFactory } from "@infrastructure/factories/EntityFactory.ts";
import { EntityRepositoryMobX } from "@infrastructure/repositories/mobx/EntityRepositoryMobX.ts";
import { SceneRepositoryMobX } from "@infrastructure/repositories/mobx/SceneRepositoryMobX.ts";
import { CanvasEventHandler } from "@infrastructure/ui/eventHandlers/CanvasEventHandler.ts";
import { SceneRenderer } from "@infrastructure/ui/renderers/SceneRenderer.ts";
import { retinaFix } from "@infrastructure/ui/utils/retina-fix.ts";
import { DrawEntityUseCase } from "@use-cases";

export class Application {
	private unsubscribeCollection: (() => void)[] = [];

	constructor() {
		const $canvas = document.querySelector("canvas");
		const ctx = $canvas?.getContext("2d");
		if (!$canvas || !ctx) {
			throw new Error("Can't find canvas");
		}

		const dpr = window.devicePixelRatio || 1;
		retinaFix(ctx, dpr);

		const entityFactory = new EntityFactory();

		const entityRepository = new EntityRepositoryMobX();
		const sceneRepository = new SceneRepositoryMobX(new Size($canvas.clientWidth, $canvas.clientHeight));

		const drawEntityUseCase = new DrawEntityUseCase(entityRepository, entityFactory);

		const mouseController = new MouseController(sceneRepository, drawEntityUseCase);
		const sceneRenderer = new SceneRenderer(ctx, entityRepository, sceneRepository);
		const canvasEventHandler = new CanvasEventHandler($canvas, mouseController);

		this.unsubscribeCollection = [
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
		this.unsubscribeCollection.forEach(unsubscribe => unsubscribe());
	}
}
