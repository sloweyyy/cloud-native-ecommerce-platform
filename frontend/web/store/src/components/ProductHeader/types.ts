export type ProductFilterType = 'all';

export type SortOption =
  | 'default'
  | 'priceAsc'
  | 'priceDesc'
  | 'nameAsc'
  | 'nameDesc';

export type SortOptionConfig = {
  label: string;
  value: SortOption;
};

export type SpecialFilterConfig = {
  label: string;
  value: ProductFilterType;
  icon: React.ReactNode;
};

