export function debounce<T extends (...args: unknown[]) => unknown>(
	fn: T,
	ms: number,
): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return function (this: unknown, ...args: Parameters<T>) {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			fn.apply(this, args);
			timeoutId = null;
		}, ms);
	};
}
