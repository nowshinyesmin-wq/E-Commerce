export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY';

export type ProductReview = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  verified: boolean;
};

export type ProductVariant = {
  id: string;
  color: string;
  size: string;
  price: number;
  stock: number;
  image: string;
  accent: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: 'Men' | 'Women' | 'Accessories' | 'Sale';
  material: string;
  fit: 'Regular' | 'Slim' | 'Relaxed';
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  accent: string;
  badge?: string;
  variants: ProductVariant[];
  reviews: ProductReview[];
  orderHistory: number;
};

export const currencyRates: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 156,
};
