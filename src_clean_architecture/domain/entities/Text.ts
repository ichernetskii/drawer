import { Entity, type IEntityStyle } from "@domain/entities/Entity.ts";
import type { IClonable } from "@domain/interfaces/IClonable.d.ts";
import { Color } from "@domain/value-objects/Color.ts";
import { Font } from "@domain/value-objects/Font.ts";
import type { Position } from "@domain/value-objects/Position.ts";

interface ITextStyle extends IEntityStyle {
	font: Font;
}

export class Text extends Entity implements IClonable<Text> {
	static override readonly type = "text" as const;
	declare getType: () => typeof Text.type;

	override style: ITextStyle = this.style;
	text: string = "";

	constructor(position: Position) {
		super(position);
		this.style.font = new Font();
		this.style.fill.color = Color.White;
	}

	override clone() {
		const clone = super.clone();
		clone.text = this.text;
		clone.style.font = this.style.font.clone();
		return clone;
	}
}
