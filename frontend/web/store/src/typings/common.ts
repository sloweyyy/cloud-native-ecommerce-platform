export type Maybe<T> = T | null | undefined;
export type PartialRecord<O, K extends keyof O = keyof O> = Partial<
  Record<K, O[K]>
>;
export type LocaleSupported = 'en' | 'de';
export type Locale = 'en' | 'de';

export type Camelize<T extends string> = T extends `${infer A}_${infer B}`
  ? `${A}${Camelize<Capitalize<B>>}`
  : T;

export type CamelizeKeys<T extends object> = {
  [key in keyof T as key extends string ? Camelize<key> : key]: T[key];
};

export type Nullable<T> = T | null | undefined;

export type Store<S, A> = S & { actions: A };

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

export type ReactQueryUnwrapPromise<T extends (...args: any) => any> = Awaited<
  ReturnType<T>
>;

export type FormItemProps<Value = unknown> = {
  id?: string;
  value?: Value;
  onChange?: (value?: Nullable<Value>) => void;
  disabled?: boolean;
  ref?: React.Ref<unknown>;
};

export type Union<T extends unknown[]> = T[number];

export type Intersection<T extends unknown[]> = T extends [
  infer First,
  ...infer Rest
]
  ? First & Intersection<Rest>
  : unknown;

export type RequiredWithType<T> = {
  [K in keyof T]-?: T[K];
};
