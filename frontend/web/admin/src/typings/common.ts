/**
 * Unwrap Promise type from async function
 */
export type ReactQueryUnwrapPromise<
  T extends (...args: any[]) => any
> = Awaited<ReturnType<T>>;

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

