import { FireOutlined, StarOutlined } from '@ant-design/icons';
import {
  SortOptionConfig,
  SpecialFilterConfig,
} from './types';

export const SORT_OPTIONS: SortOptionConfig[] = [
  { label: 'Default', value: 'default' },
  { label: 'Price: Low to High', value: 'priceAsc' },
  { label: 'Price: High to Low', value: 'priceDesc' },
  { label: 'Name: A to Z', value: 'nameAsc' },
  { label: 'Name: Z to A', value: 'nameDesc' },
];

export const SPECIAL_FILTERS: SpecialFilterConfig[] = [];

