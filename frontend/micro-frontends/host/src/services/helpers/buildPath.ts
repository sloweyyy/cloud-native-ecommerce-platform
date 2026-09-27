/**
 * Build path by replacing placeholders with actual values from params or payload
 * @param path - Path template with placeholders like "/users/:id" or "/posts/:postId/comments/:commentId"
 * @param params - Request parameters
 * @param payload - Request payload
 * @returns Object with finalPath and usedKeys
 */
export function buildPath(
  path: string,
  params: Record<string, unknown> = {},
  payload: Record<string, unknown> = {}
): { finalPath: string; usedKeys: Set<string> } {
  const usedKeys = new Set<string>();
  
  // Replace :placeholder with actual values from params or payload
  const finalPath = path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, key) => {
    usedKeys.add(key);
    
    if (key in params) {
      return String(params[key]);
    }
    if (key in payload) {
      return String(payload[key]);
    }
    
    // If not found, leave the placeholder as is (will likely cause an error)
    console.warn(`Path placeholder :${key} not found in params or payload`);
    return match;
  });

  return { finalPath, usedKeys };
}

