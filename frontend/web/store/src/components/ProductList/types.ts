export type ProductFilterType = 'all' | 'new-arrivals' | 'best-seller';

export type SortOption =
  | 'default'
  | 'priceAsc'
  | 'priceDesc'
  | 'nameAsc'
  | 'nameDesc';

export type SortOptionItem = {
  label: string;
  value: SortOption;
};

export const SORT_OPTIONS: readonly SortOptionItem[] = [
  { label: 'Default', value: 'default' },
  { label: 'Price: Low to High', value: 'priceAsc' },
  { label: 'Price: High to Low', value: 'priceDesc' },
  { label: 'Name: A to Z', value: 'nameAsc' },
  { label: 'Name: Z to A', value: 'nameDesc' },
] as const;
