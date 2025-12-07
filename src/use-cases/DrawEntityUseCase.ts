import type { IEntityFactory, IEntityRepository, ScenePosition, SceneSize } from "@domain";

export class DrawEntityUseCase {
	entityRepository: IEntityRepository;
	entityFactory: IEntityFactory;

	constructor(entityRepository: IEntityRepository, entityFactory: IEntityFactory) {
		this.entityRepository = entityRepository;
		this.entityFactory = entityFactory;
	}

	start(type: string, position: ScenePosition) {
		const drawingEntity = this.entityFactory(type, position);
		this.entityRepository.setDrawingEntity(drawingEntity);
	}

	update(size: SceneSize) {
		const drawingEntity = this.entityRepository.drawingEntity;
		if (drawingEntity) {
			this.entityRepository.setEntitySize(drawingEntity.id, size);
		}
	}

	finish() {
		const drawingEntity = this.entityRepository.drawingEntity;
		if (drawingEntity) {
			this.entityRepository.addEntity(drawingEntity);
			this.entityRepository.setDrawingEntity(null);
		}
	}
}
