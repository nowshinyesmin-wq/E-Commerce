import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  name: string;
  variantId: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
};

export type CartState = {
  items: CartItem[];
  promoCodes: string[];
  freeShippingThreshold: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  addPromo: (code: string) => void;
  removePromo: (code: string) => void;
};

const initialPromoCodes = ['SPRING10'];

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [
        {
          id: 'item-1',
          name: 'Monarch Wool Coat',
          variantId: 'v1',
          color: 'Carbon',
          size: 'S',
          price: 280,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
        },
      ],
      promoCodes: initialPromoCodes,
      freeShippingThreshold: 220,
      addItem: (item) =>
        set((state) => {
          const currentItem = state.items.find((entry) => entry.id === item.id);
          if (currentItem) {
            return {
              items: state.items.map((entry) =>
                entry.id === item.id
                  ? { ...entry, quantity: entry.quantity + item.quantity }
                  : entry,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      updateQuantity: (id, delta) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item,
            )
            .filter((item) => item.quantity > 0),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      addPromo: (code) =>
        set((state) => ({
          promoCodes: state.promoCodes.includes(code) ? state.promoCodes : [...state.promoCodes, code],
        })),
      removePromo: (code) =>
        set((state) => ({
          promoCodes: state.promoCodes.filter((item) => item !== code),
        })),
    }),
    {
      name: 'atelier-cart',
    },
  ),
);
