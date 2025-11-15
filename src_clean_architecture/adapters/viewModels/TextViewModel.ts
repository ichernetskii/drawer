import { EntityViewModel } from "@adapters/viewModels/EntityViewModel.ts";
import type { Text } from "@domain";

export class TextViewModel extends EntityViewModel {
	readonly text: string;
	readonly textFillStyle: string;

	constructor(text: Text) {
		super(text);
		this.text = text.text;
		this.textFillStyle = text.style.text.color.toString();
	}
}
