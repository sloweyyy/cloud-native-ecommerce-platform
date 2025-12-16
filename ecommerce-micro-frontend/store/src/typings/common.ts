export type ReactQueryUnwrapPromise<
  T extends (...args: any[]) => any
> = Awaited<ReturnType<T>>;

