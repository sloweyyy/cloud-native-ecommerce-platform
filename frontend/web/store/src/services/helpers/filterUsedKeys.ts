export function filterUsedKeys<T extends Record<PropertyKey, unknown>>(
  data: T,
  usedKeys: Set<string>
): Partial<T> {
  return Object.keys(data).reduce((acc, key) => {
    if (!usedKeys.has(key)) {
      (acc as Record<PropertyKey, any>)[key] = data[key];
    }
    return acc;
  }, {} as Partial<T>);
}
