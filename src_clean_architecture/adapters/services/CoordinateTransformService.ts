import type { ISceneRepository } from "@adapters/repositories/ISceneRepository.d.ts";
import { Position, Size } from "@domain";

export class CoordinateTransformService {
	static scenePositionToClient(scenePosition: Position, scene: ISceneRepository): Position {
		// Transform stack: translate(-origin) → scale(zoom, -zoom) → translate(screenCenter)
		let position = scenePosition.moveBy(-scene.origin.x, -scene.origin.y);
		position = new Position(position.x * scene.zoom, position.y * -scene.zoom);
		position = position.moveBy(scene.size.width / 2, scene.size.height / 2);
		return position;
	}

	static clientPositionToScene(clientPosition: Position, scene: ISceneRepository): Position {
		// Inverse transform: translate(-screenCenter) → scale(1/zoom, -1/zoom) → translate(origin)
		let position = clientPosition.moveBy(-scene.size.width / 2, -scene.size.height / 2);
		position = new Position(position.x / scene.zoom, position.y / -scene.zoom);
		position = position.moveBy(scene.origin.x, scene.origin.y);
		return position;
	}

	static sceneSizeToClient(sceneSize: Size, scene: ISceneRepository): Size {
		return sceneSize.scale(scene.zoom);
	}

	static clientSizeToScene(clientSize: Size, scene: ISceneRepository): Size {
		return clientSize.scale(1 / scene.zoom);
	}
}
