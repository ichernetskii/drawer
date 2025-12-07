import { ClientPosition, ClientSize, type IEntityRepository } from "@domain";
import type { ISceneRepository } from "@domain/interfaces/repositories/ISceneRepository.d.ts";
import type { DrawEntityUseCase } from "@use-cases";

export class MouseController {
	entityRepository: IEntityRepository;
	sceneRepository: ISceneRepository;
	drawEntityUseCase: DrawEntityUseCase;
	private mouseDownPosition: ClientPosition | null = null;

	constructor(
		entityRepository: IEntityRepository,
		sceneRepository: ISceneRepository,
		drawEntityUseCase: DrawEntityUseCase,
	) {
		this.entityRepository = entityRepository;
		this.sceneRepository = sceneRepository;
		this.drawEntityUseCase = drawEntityUseCase;
	}

	onMouseDown = (event: MouseEvent) => {
		this.mouseDownPosition = new ClientPosition(event.offsetX, event.offsetY);
		const newScenePosition = this.sceneRepository.scene.toScenePosition(this.mouseDownPosition);
		this.drawEntityUseCase.start(this.entityRepository.tool, newScenePosition);
	};

	onMouseMove = (event: MouseEvent) => {
		if (this.mouseDownPosition) {
			const width = event.offsetX - this.mouseDownPosition.x;
			const height = event.offsetY - this.mouseDownPosition.y;
			const newClientSize = new ClientSize(width, height);
			const newSceneSize = this.sceneRepository.scene.toSceneSize(newClientSize);
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
