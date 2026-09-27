export function buildPath(
  path: string,
  params: Record<string, string | number> = {},
  payload: Record<string, string | number> = {}
): { finalPath: string; usedKeys: Set<string> } {
  const usedKeys = new Set<string>();

  const finalPath = path.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
    if (params[key] !== undefined) {
      usedKeys.add(key);
      return String(params[key]);
    }
    if (payload[key] !== undefined) {
      usedKeys.add(key);
      return String(payload[key]);
    }
    return `:${key}`;
  });

  return { finalPath, usedKeys };
}
