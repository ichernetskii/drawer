import { action, computed, makeObservable, observable } from "mobx";

type AnnotationsMap = Record<string, typeof observable | typeof computed | typeof action>;

/**
 * Automatically creates MobX annotations for an object by introspecting its properties.
 * - Protected fields (_fieldName) -> observable
 * - Getters -> computed
 * - Methods -> action
 */
export function makeObservableAuto<T extends object, K extends PropertyKey = never>(
	target: T,
	excludeFields: K[] = [],
): T {
	const annotations: AnnotationsMap = {};
	const excludeSet = new Set<PropertyKey>(excludeFields);
	const processedNames = new Set<string>();

	// Walk up the prototype chain until we reach Object.prototype
	let proto = Object.getPrototypeOf(target);

	while (proto && proto !== Object.prototype) {
		const propertyNames = Object.getOwnPropertyNames(proto);

		for (const name of propertyNames) {
			// Skip constructor and already processed properties
			if (name === "constructor" || processedNames.has(name) || excludeSet.has(name)) {
				continue;
			}

			processedNames.add(name);

			const descriptor = Object.getOwnPropertyDescriptor(proto, name);
			if (!descriptor) continue;

			// Check if it's a getter
			if (descriptor.get) {
				annotations[name] = computed;
			}
			// Check if it's a method (function value)
			else if (typeof descriptor.value === "function") {
				annotations[name] = action;
			}
		}

		proto = Object.getPrototypeOf(proto);
	}

	// Process own properties on the instance (protected fields like _position)
	for (const name of Object.getOwnPropertyNames(target)) {
		if (excludeSet.has(name) || processedNames.has(name)) {
			continue;
		}

		const descriptor = Object.getOwnPropertyDescriptor(target, name);
		if (!descriptor) continue;

		// If it's a data property (not getter/setter), mark as observable
		if (descriptor.value !== undefined && typeof descriptor.value !== "function") {
			annotations[name] = observable;
			processedNames.add(name);
		}
	}

	makeObservable(target, annotations);
	return target;
}
