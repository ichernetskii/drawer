import { Entity, type IEntityStyle } from "@domain/entities/Entity.ts";
import type { IClonable } from "@domain/interfaces/IClonable.d.ts";
import { Font } from "@domain/value-objects/Font.ts";

interface ITextStyle extends IEntityStyle {
	font: Font;
}

export class Text extends Entity implements IClonable<Text> {
	static override readonly type = "text" as const;
	declare getType: () => typeof Text.type;

	override style: ITextStyle = {
		...this.style,
		font: new Font(),
	};

	text: string = "";

	override clone() {
		const clone = super.clone();
		clone.text = this.text;
		clone.style.font = this.style.font.clone();
		return clone;
	}
}
