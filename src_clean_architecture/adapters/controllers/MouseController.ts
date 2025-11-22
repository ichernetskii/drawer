import type { ISceneRepository } from "@adapters/repositories/ISceneRepository.d.ts";
import { CoordinateTransformService } from "@adapters/services/CoordinateTransformService.ts";
import { Position, Size } from "@domain";
import type { DrawEntityUseCase } from "@use-cases";

export class MouseController {
	sceneRepository: ISceneRepository;
	drawEntityUseCase: DrawEntityUseCase;
	private mouseDownPosition: Position | null = null;

	constructor(sceneRepository: ISceneRepository, drawEntityUseCase: DrawEntityUseCase) {
		this.sceneRepository = sceneRepository;
		this.drawEntityUseCase = drawEntityUseCase;
	}

	onMouseDown = (event: MouseEvent) => {
		this.mouseDownPosition = new Position(event.offsetX, event.offsetY);
		const newScenePosition = CoordinateTransformService.clientPositionToScene(
			this.mouseDownPosition,
			this.sceneRepository,
		);
		this.drawEntityUseCase.start(this.sceneRepository.tool, newScenePosition);
	};

	onMouseMove = (event: MouseEvent) => {
		if (this.mouseDownPosition) {
			const width = event.offsetX - this.mouseDownPosition.x;
			const height = event.offsetY - this.mouseDownPosition.y;
			const newClientSize = new Size(width, height);
			const newSceneSize = CoordinateTransformService.clientSizeToScene(newClientSize, this.sceneRepository);
			this.drawEntityUseCase.update(newSceneSize);
		}
	};

	onMouseUp = () => {
		this.mouseDownPosition = null;
		this.drawEntityUseCase.finish();
	};

	onContextMenu = (event: MouseEvent) => {
		event.preventDefault();
	};
}
