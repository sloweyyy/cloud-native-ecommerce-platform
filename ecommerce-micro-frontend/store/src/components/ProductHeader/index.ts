// Main component
export { default as ProductHeader } from './ProductHeader';

// Sub-components
export { default as ProductStats } from './ProductStats';
export { default as ProductSort } from './ProductSort';
export { default as ProductFilters } from './ProductFilters';
export { default as FilterTag } from './FilterTag';

// Types and configurations
export type {
  ProductFilterType,
  SortOption,
  SortOptionConfig,
  SpecialFilterConfig,
} from './types';
export { SORT_OPTIONS, SPECIAL_FILTERS } from './constants';

