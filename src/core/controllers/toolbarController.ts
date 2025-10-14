import "@/shared/styles/toolbar.css";

import { reaction } from "mobx";

import { Ellipse } from "@/store/entity/drawable/ellipse/ellipse.ts";
import { Rectangle } from "@/store/entity/drawable/rectangle/rectangle.ts";
import { SelectionPreview } from "@/store/entity/selection/selectionPreview/selectionPreview.ts";
import type { SceneStore } from "@/store/sceneStore.ts";

const CSS_CLASSES = {
	BUTTON: "toolbar__button",
	BUTTON_ACTIVE: "toolbar__button--active",
} as const;

const TOOL_CONFIG = [
	{
		type: SelectionPreview.type,
		title: "Selection (V)",
		icon: '<path d="M2 2 L2 18 L18 18 L18 2 Z" stroke="currentColor" fill="none" stroke-width="2"/>',
	},
	{
		type: Rectangle.type,
		title: "Rectangle (R)",
		icon: '<rect x="3" y="5" width="14" height="10" stroke="currentColor" fill="currentColor"/>',
	},
	{
		type: Ellipse.type,
		title: "Ellipse (E)",
		icon: '<ellipse cx="10" cy="10" rx="7" ry="5" stroke="currentColor" fill="currentColor"/>',
	},
] as const;

export class ToolbarController {
	private readonly abortController = new AbortController();
	private readonly toolbarElement: HTMLElement;
	private readonly sceneStore: SceneStore;
	private readonly toolMap = new WeakMap<HTMLButtonElement, string>();

	constructor(toolbarElement: HTMLElement, sceneStore: SceneStore) {
		this.toolbarElement = toolbarElement;
		this.sceneStore = sceneStore;
	}

	init() {
		this.createButtons();
		this.setupEventListeners();
		this.setupReactions();
		this.updateActiveButton(this.sceneStore.tool);
	}

	destroy() {
		this.abortController.abort();
	}

	private createButtons() {
		this.toolbarElement.innerHTML = "";

		TOOL_CONFIG.forEach(({ type, title, icon }) => {
			const button = document.createElement("button");
			button.className = CSS_CLASSES.BUTTON;
			button.title = title;
			button.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20">${icon}</svg>`;

			this.toolMap.set(button, type);
			this.toolbarElement.appendChild(button);
		});
	}

	private setupEventListeners() {
		this.toolbarElement.addEventListener(
			"click",
			e => {
				const button = (e.target as HTMLElement).closest<HTMLButtonElement>(`.${CSS_CLASSES.BUTTON}`);
				if (!button) return;

				const tool = this.toolMap.get(button);
				if (tool) {
					this.sceneStore.tool = tool;
				}
			},
			{ signal: this.abortController.signal },
		);
	}

	private setupReactions() {
		reaction(
			() => this.sceneStore.tool,
			tool => this.updateActiveButton(tool),
			{ signal: this.abortController.signal },
		);
	}

	private updateActiveButton(activeTool: string) {
		const buttons = this.toolbarElement.querySelectorAll<HTMLButtonElement>(`.${CSS_CLASSES.BUTTON}`);

		buttons.forEach(button => {
			const isActive = this.toolMap.get(button) === activeTool;
			button.classList.toggle(CSS_CLASSES.BUTTON_ACTIVE, isActive);
		});
	}
}
