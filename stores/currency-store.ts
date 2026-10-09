import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { currencyRates, type CurrencyCode } from '@/lib/mock-data';

export type CurrencyState = {
  currency: CurrencyCode;
  symbol: string;
  rates: Record<CurrencyCode, number>;
  setCurrency: (currency: CurrencyCode) => void;
  convertPrice: (amount: number) => number;
};

const currencySymbols: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      symbol: '$',
      rates: currencyRates,
      setCurrency: (currency) => {
        set({ currency, symbol: currencySymbols[currency] });
      },
      convertPrice: (amount) => {
        const { currency, rates } = get();
        return Number((amount * rates[currency]).toFixed(2));
      },
    }),
    {
      name: 'atelier-currency',
    },
  ),
);
