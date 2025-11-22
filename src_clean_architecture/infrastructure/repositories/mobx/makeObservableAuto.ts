import { action, computed, makeAutoObservable, makeObservable, observable } from "mobx";
import { isObservableObject } from "mobx";

type AnnotationsMap = Record<string, typeof observable | typeof computed | typeof action>;

/**
 * Automatically creates MobX annotations for an object by introspecting its properties.
 * Makes nested objects observable recursively.
 */
export function makeObservableAuto<T extends object, K extends keyof T = never>(
	target: T,
	excludeFields: K[] = [],
	options: { autoBind?: boolean } = {},
): T {
	// ВАЖНО: Сначала делаем вложенные объекты observable
	// до того, как делать observable родительский объект
	for (const name of Object.getOwnPropertyNames(target)) {
		if (excludeFields.includes(name as K)) continue;

		const value = (target as any)[name];
		if (typeof value === "object" && value !== null && !isObservableObject(value)) {
			// Для простых объектов без прототипа используем makeAutoObservable
			if (Object.getPrototypeOf(value) === Object.prototype) {
				makeAutoObservable(value);
			} else {
				// Для классов рекурсивно вызываем makeObservableAuto
				makeObservableAuto(value, [], options);
			}
		}
	}

	// Теперь создаем аннотации для самого объекта
	const annotations: AnnotationsMap = {};
	const excludeSet = new Set<PropertyKey>(excludeFields);
	const processedNames = new Set<string>();

	// Обрабатываем instance properties
	for (const name of Object.getOwnPropertyNames(target)) {
		if (excludeSet.has(name) || processedNames.has(name)) {
			continue;
		}

		const descriptor = Object.getOwnPropertyDescriptor(target, name);
		if (!descriptor) continue;

		if (descriptor.value !== undefined && typeof descriptor.value !== "function") {
			// Используем observable.ref для уже observable объектов
			annotations[name] = observable;
			processedNames.add(name);
		}
	}

	// Обрабатываем методы из прототипа
	let proto = Object.getPrototypeOf(target);

	while (proto && proto !== Object.prototype) {
		const propertyNames = Object.getOwnPropertyNames(proto);

		for (const name of propertyNames) {
			if (name === "constructor" || processedNames.has(name) || excludeSet.has(name)) {
				continue;
			}

			processedNames.add(name);

			const descriptor = Object.getOwnPropertyDescriptor(proto, name);
			if (!descriptor) continue;

			if (descriptor.get && descriptor.set) {
				annotations[name] = computed;
			} else if (descriptor.get) {
				annotations[name] = computed;
			} else if (descriptor.set) {
				annotations[name] = action;
			} else if (typeof descriptor.value === "function") {
				annotations[name] = action;
			}
		}

		proto = Object.getPrototypeOf(proto);
	}

	// Делаем объект observable
	makeObservable(target, annotations, options);
	return target;
}
