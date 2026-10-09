import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WishlistItem = {
  id: string;
  variantId?: string;
};

export type WishlistState = {
  savedIds: string[];
  alertIds: string[];
  toggleSaved: (id: string) => void;
  toggleAlert: (id: string) => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      savedIds: ['prod-3'],
      alertIds: ['prod-1'],
      toggleSaved: (id) =>
        set((state) => ({
          savedIds: state.savedIds.includes(id)
            ? state.savedIds.filter((item) => item !== id)
            : [...state.savedIds, id],
        })),
      toggleAlert: (id) =>
        set((state) => ({
          alertIds: state.alertIds.includes(id)
            ? state.alertIds.filter((item) => item !== id)
            : [...state.alertIds, id],
        })),
    }),
    {
      name: 'atelier-wishlist',
    },
  ),
);
