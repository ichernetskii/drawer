export type ToPlainObject<T> = T extends (...args: never[]) => unknown
	? never
	: T extends object
		? {
				[K in keyof T as T[K] extends (...args: never[]) => unknown ? never : K]: ToPlainObject<T[K]>;
			}
		: T;
