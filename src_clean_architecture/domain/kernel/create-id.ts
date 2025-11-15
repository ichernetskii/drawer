export const createId = (() => {
	let counter = 0;
	return () => counter++;
})();
