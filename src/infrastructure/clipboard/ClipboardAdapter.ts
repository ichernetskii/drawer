import type { Drawable } from "@/domain/entity/drawable/Drawable.ts";
import type { DrawableStorable } from "@/infrastructure/serialization/drawableSerialization.ts";
import { deserializeDrawables, serializeDrawables } from "@/infrastructure/serialization/drawableSerialization.ts";

interface ClipboardData {
	version: number;
	app: string;
	drawables: DrawableStorable[];
}

/**
 * Adapter for clipboard operations.
 * Handles both internal clipboard and system clipboard (via Clipboard API).
 */
export class ClipboardAdapter {
	private internalClipboard: Drawable[] = [];

	/**
	 * Copies drawables to clipboard (internal + system if available).
	 */
	async copy(drawables: Drawable[]): Promise<void> {
		if (drawables.length === 0) return;

		// Store in internal clipboard
		this.internalClipboard = [...drawables];

		// Try to copy to system clipboard
		if (navigator.clipboard && navigator.clipboard.writeText) {
			try {
				const json = this.serializeToJSON(drawables);
				await navigator.clipboard.writeText(json);
			} catch (error) {
				// Fallback: system clipboard unavailable, use only internal
				console.warn("System clipboard unavailable:", error);
			}
		}
	}

	/**
	 * Pastes drawables from clipboard.
	 * Tries system clipboard first, then falls back to internal clipboard.
	 */
	async paste(): Promise<Drawable[]> {
		// Try to read from system clipboard
		if (navigator.clipboard && navigator.clipboard.readText) {
			try {
				const jsonSerialized = await navigator.clipboard.readText();
				const drawables = this.deserializeFromJSON(jsonSerialized);
				if (drawables.length > 0) {
					return drawables;
				}
			} catch (error) {
				// Fallback to internal clipboard
				console.warn("Cannot read from system clipboard: ", error);
			}
		}

		// Fallback: use internal clipboard
		if (this.internalClipboard.length === 0) return [];

		// Clone drawables from internal clipboard using serialization
		const data = serializeDrawables(this.internalClipboard);
		return deserializeDrawables(data);
	}

	/**
	 * Serializes drawables to JSON string.
	 */
	private serializeToJSON(drawables: Drawable[]): string {
		const clipboardData: ClipboardData = {
			version: 1,
			app: "drawer",
			drawables: serializeDrawables(drawables),
		};

		return JSON.stringify(clipboardData, null, 2);
	}

	/**
	 * Deserializes JSON string to drawables.
	 */
	private deserializeFromJSON(jsonSerialized: string): Drawable[] {
		try {
			const clipboardData: ClipboardData = JSON.parse(jsonSerialized);

			// Validate format
			if (clipboardData.app !== "drawer" || !Array.isArray(clipboardData.drawables)) {
				return [];
			}

			// Recreate drawables
			return deserializeDrawables(clipboardData.drawables);
		} catch (error) {
			console.warn("Failed to deserialize clipboard data:", error);
			return [];
		}
	}
}
