type SearchParams = Record<string, unknown>;

export function createSearchSerializer(order: string[]) {
  return {
    stringify(search: SearchParams): string {
      const ordered: SearchParams = {};
      const rest: SearchParams = {};

      order.forEach((key) => {
        if (
          search[key] !== undefined &&
          search[key] !== null &&
          search[key] !== ''
        ) {
          ordered[key] = search[key];
        }
      });

      Object.entries(search).forEach(([key, value]) => {
        if (
          !order.includes(key) &&
          value !== undefined &&
          value !== null &&
          value !== ''
        ) {
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
