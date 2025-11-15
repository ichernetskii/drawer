import type { ISceneRepository } from "@adapters/repositories/ISceneRepository.d.ts";
import { Position, Size } from "@domain";

export class CoordinateTransformService {
	static scenePositionToClient(scenePosition: Position, scene: ISceneRepository): Position {
		const position = scenePosition.moveBy(-scene.origin.x, -scene.origin.y);
		position.x *= scene.zoom;
		position.y *= -scene.zoom;
		position.moveBy(scene.size.width / 2, scene.size.height / 2);
		return position;
	}

	static clientPositionToScene(clientPosition: Position, scene: ISceneRepository): Position {
		const position = clientPosition.moveBy(-scene.size.width / 2, -scene.size.height / 2);
		position.x /= scene.zoom;
		position.y /= -scene.zoom;
		position.moveBy(scene.origin.x, scene.origin.y);
		return position;
	}

	static sceneSizeToClient(sceneSize: Size, scene: ISceneRepository): Size {
		return new Size(sceneSize.width * scene.zoom, sceneSize.height * scene.zoom);
	}

	static clientSizeToScene(clientSize: Size, scene: ISceneRepository): Size {
		return clientSize.scale(1 / scene.zoom);
	}
}
