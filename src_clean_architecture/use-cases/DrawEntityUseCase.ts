import type { IEntityFactory, IEntityRepository, Position, Size } from "@domain";

export class DrawEntityUseCase {
	entityRepository: IEntityRepository;
	entityFactory: IEntityFactory;

	constructor(entityRepository: IEntityRepository, entityFactory: IEntityFactory) {
		this.entityRepository = entityRepository;
		this.entityFactory = entityFactory;
	}

	start(type: string, position: Position) {
		const drawingEntity = this.entityFactory.createEntity(type, position);
		this.entityRepository.setDrawingEntity(drawingEntity);
	}

	update(size: Size) {
		const drawingEntity = this.entityRepository.getDrawingEntity()?.clone();
		if (drawingEntity) {
			drawingEntity.size = size.clone();
			this.entityRepository.setDrawingEntity(drawingEntity);
		}
	}

	finish() {
		const drawingEntity = this.entityRepository.getDrawingEntity();
		if (drawingEntity) {
			this.entityRepository.add(drawingEntity);
		}
	}
}
