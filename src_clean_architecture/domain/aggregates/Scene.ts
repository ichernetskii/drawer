import { ClientPosition, ScenePosition } from "@domain/value-objects/Position.ts";
import { ClientSize, SceneSize } from "@domain/value-objects/Size.ts";

export class Scene {
	zoom: number = 1;
	origin: ScenePosition = new ScenePosition(0, 0);
	size: ClientSize;

	constructor(size: ClientSize) {
		this.size = size;
	}

	toClientPosition(scenePosition: ScenePosition): ClientPosition {
		const x = scenePosition.x - this.origin.x;
		const y = scenePosition.y - this.origin.y;
		const position = new ClientPosition(x * this.zoom, y * -this.zoom);
		position.x += this.size.width / 2;
		position.y += this.size.height / 2;
		return position;
	}

	toScenePosition(clientPosition: ClientPosition): ScenePosition {
		const x = clientPosition.x - this.size.width / 2;
		const y = clientPosition.y - this.size.height / 2;
		const position = new ScenePosition(x / this.zoom, y / -this.zoom);
		position.x += this.origin.x;
		position.y += this.origin.y;
		return position;
	}

	toClientSize(sceneSize: SceneSize): ClientSize {
		return new ClientSize(sceneSize.width * this.zoom, sceneSize.height * this.zoom);
	}

	toSceneSize(clientSize: ClientSize): SceneSize {
		return new SceneSize(clientSize.width / this.zoom, clientSize.height / this.zoom);
	}
}
