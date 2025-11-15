import { Entity, type IEntityStyle } from "@domain/entities/Entity.ts";
import type { IClonable } from "@domain/interfaces/IClonable.d.ts";
import { Color } from "@domain/value-objects/Color.ts";

interface ITextStyle extends IEntityStyle {
	text: {
		color: Color;
	};
}

export class Text extends Entity implements IClonable<Text> {
	static override readonly type = "text" as const;
	declare getType: () => typeof Text.type;

	override style: ITextStyle = {
		...this.style,
		text: {
			color: Color.White,
		},
	};

	text: string = "";

	override clone() {
		const clone = super.clone();
		clone.text = this.text;
		clone.style.text = {
			color: this.style.text.color.clone(),
		};
		return clone;
	}
}
