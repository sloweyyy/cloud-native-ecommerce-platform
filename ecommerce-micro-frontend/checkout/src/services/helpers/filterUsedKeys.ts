/**
 * Filter out keys that were used in path construction
 * to avoid sending them as query params
 */
export function filterUsedKeys(
  obj: Record<PropertyKey, unknown>,
  usedKeys: Set<string>
): Record<PropertyKey, unknown> {
  const filtered: Record<PropertyKey, unknown> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (!usedKeys.has(key)) {
      filtered[key] = value;
    }
  }
  
  return filtered;
}

