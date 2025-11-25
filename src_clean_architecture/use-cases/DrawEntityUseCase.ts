import type { IEntityFactory, IEntityRepository, Position, Size } from "@domain";

export class DrawEntityUseCase {
	entityRepository: IEntityRepository;
	entityFactory: IEntityFactory;

	constructor(entityRepository: IEntityRepository, entityFactory: IEntityFactory) {
		this.entityRepository = entityRepository;
		this.entityFactory = entityFactory;
	}

	start(type: string, position: Position) {
		const drawingEntity = this.entityFactory(type, position);
		this.entityRepository.setDrawingEntity(drawingEntity);
	}

	update(size: Size) {
		const drawingEntity = this.entityRepository.drawingEntity;
		if (drawingEntity) {
			this.entityRepository.setSize(drawingEntity, size);
		}
	}

	finish() {
		const drawingEntity = this.entityRepository.drawingEntity;
		if (drawingEntity) {
			this.entityRepository.add(drawingEntity);
			this.entityRepository.setDrawingEntity(null);
		}
	}
}
