import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SortMode = 'featured' | 'price-asc' | 'price-desc' | 'rating';

export type FilterState = {
  category: 'All' | 'Men' | 'Women' | 'Accessories' | 'Sale';
  sortBy: SortMode;
  search: string;
  setCategory: (category: FilterState['category']) => void;
  setSortBy: (sortBy: SortMode) => void;
  setSearch: (search: string) => void;
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      category: 'All',
      sortBy: 'featured',
      search: '',
      setCategory: (category) => set({ category }),
      setSortBy: (sortBy) => set({ sortBy }),
      setSearch: (search) => set({ search }),
    }),
    {
      name: 'atelier-filters',
    },
  ),
);
