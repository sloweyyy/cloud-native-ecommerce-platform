type SearchParams = Record<string, unknown>;

/**
 * Creates a search parameter serializer that maintains key order
 * @param order - Array of keys to prioritize in the search string
 * @returns Object with stringify and parse methods
 */
export function createSearchSerializer(order: string[]) {
  return {
    stringify(search: SearchParams): string {
      const ordered: SearchParams = {};
      const rest: SearchParams = {};

      // Put the keys in order first
      order.forEach((key) => {
        if (search[key] !== undefined && search[key] !== null && search[key] !== '') {
          ordered[key] = search[key];
        }
      });

      // The rest will be appended after
      Object.entries(search).forEach(([key, value]) => {
        if (!order.includes(key) && value !== undefined && value !== null && value !== '') {
          rest[key] = value;
        }
      });

      const finalSearch = { ...ordered, ...rest };
      const params = new URLSearchParams();

      Object.entries(finalSearch).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      return params.toString();
    },

    parse(searchStr: string): SearchParams {
      const params = new URLSearchParams(searchStr);
      const result: SearchParams = {};

      params.forEach((value, key) => {
        result[key] = value;
      });

      return result;
    },
  };
}

