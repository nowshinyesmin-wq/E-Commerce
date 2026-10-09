import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SortMode = 'featured' | 'price-asc' | 'price-desc' | 'rating';
export type FilterCategory = 'All' | 'Men' | 'Women' | 'Accessories' | 'Sale';
export type FilterSize = 'All' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'One Size';
export type FilterPriceRange = 'All' | 'Under $100' | '$100-$150' | '$150-$250' | '$250+';
export type FilterFit = 'All' | 'Regular' | 'Slim' | 'Relaxed';
export type FilterStockStatus = 'All' | 'In stock' | 'Low stock';

export type FilterState = {
  category: FilterCategory;
  sortBy: SortMode;
  search: string;
  size: FilterSize;
  color: 'All' | string;
  priceRange: FilterPriceRange;
  material: 'All' | string;
  fit: FilterFit;
  stock: FilterStockStatus;
  setCategory: (category: FilterCategory) => void;
  setSortBy: (sortBy: SortMode) => void;
  setSearch: (search: string) => void;
  setSize: (size: FilterSize) => void;
  setColor: (color: FilterState['color']) => void;
  setPriceRange: (priceRange: FilterPriceRange) => void;
  setMaterial: (material: FilterState['material']) => void;
  setFit: (fit: FilterFit) => void;
  setStock: (stock: FilterStockStatus) => void;
  resetFilters: () => void;
};

const initialFilterState = {
  category: 'All' as const,
  sortBy: 'featured' as const,
  search: '',
  size: 'All' as const,
  color: 'All' as const,
  priceRange: 'All' as const,
  material: 'All' as const,
  fit: 'All' as const,
  stock: 'All' as const,
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...initialFilterState,
      setCategory: (category) => set({ category }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSearch: (search) => set({ search }),
      setSize: (size) => set({ size }),
      setColor: (color) => set({ color }),
      setPriceRange: (priceRange) => set({ priceRange }),
      setMaterial: (material) => set({ material }),
      setFit: (fit) => set({ fit }),
      setStock: (stock) => set({ stock }),
      resetFilters: () => set(initialFilterState),
    }),
    {
      name: 'atelier-filters',
    },
  ),
);
