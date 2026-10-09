'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { catalog, type Product, type ProductVariant } from '@/lib/mock-data';
import { cn, formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore } from '@/stores/currency-store';
import { useFilterStore } from '@/stores/filter-store';
import { useWishlistStore } from '@/stores/wishlist-store';

const categoryOptions = ['All', 'Men', 'Women', 'Accessories', 'Sale'] as const;
const sizeOptions = ['All', 'XS', 'S', 'M', 'L', 'XL', 'One Size'] as const;
const priceOptions = ['All', 'Under $100', '$100-$150', '$150-$250', '$250+'] as const;
const stockOptions = ['All', 'In stock', 'Low stock'] as const;
const materialOptions = [
  'All',
  'Wool Blend',
  'Cashmere Blend',
  'Organic Cotton',
  'Waxed Canvas',
  'Cotton French Terry',
  'Pique Cotton',
  'Ripstop Nylon',
] as const;
const fitOptions = ['All', 'Regular', 'Slim', 'Relaxed'] as const;
const colorOptions = [
  'All',
  'Carbon',
  'Sand',
  'Forest',
  'Oat',
  'Olive',
  'Stone',
  'Taupe',
  'Moss',
  'Clay',
  'Slate',
  'Cinder',
  'Dune',
  'Ink',
  'Ash',
  'Sage',
] as const;

const navItems = [
  { name: 'New Arrivals', subitems: ['Spring Edit', 'Tailoring', 'Limited Run'] },
  { name: 'Men', subitems: ['Outerwear', 'Knitwear', 'Shirts', 'Essentials'] },
  { name: 'Women', subitems: ['Dresses', 'Layering', 'Polo', 'Basics'] },
  { name: 'Accessories', subitems: ['Bags', 'Hats', 'Scarves', 'Travel'] },
  { name: 'Sale', subitems: ['Under $100', 'Last Sizes', 'Warehouse Pick'] },
] as const;

type FilterChipGroupProps = {
  label: string;
  options: readonly string[];
  selected: string;
  onSelect: (value: string) => void;
};

type FitPreference = 'Regular' | 'Slim' | 'Relaxed';

function FilterChipGroup({ label, options, selected, onSelect }: FilterChipGroupProps) {
  return (
    <div>
      <p className="mb-3 text-sm font-medium text-[#59443d]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={cn(
              'rounded-full border px-3 py-2 text-xs transition-all',
              selected === option
                ? 'border-[#a76446] bg-[#a76446] text-white'
                : 'border-[#e7d1c3] bg-white/60 text-[#382d29]',
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function getStockStatus(product: Product) {
  const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
  return totalStock <= 5 ? 'Low stock' : 'In stock';
}

export default function Home() {
  const cartItems = useCartStore((state) => state.items);
  const promoCodes = useCartStore((state) => state.promoCodes);
  const freeShippingThreshold = useCartStore((state) => state.freeShippingThreshold);
  const addItem = useCartStore((state) => state.addItem);
  const removePromo = useCartStore((state) => state.removePromo);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const { currency, convertPrice, setCurrency, symbol } = useCurrencyStore();
  const savedIds = useWishlistStore((state) => state.savedIds);
  const toggleSaved = useWishlistStore((state) => state.toggleSaved);
  const alertIds = useWishlistStore((state) => state.alertIds);
  const toggleAlert = useWishlistStore((state) => state.toggleAlert);

  const {
    category,
    sortBy,
    search,
    size,
    color,
    priceRange,
    material,
    fit,
    stock,
    setCategory,
    setSortBy,
    setSearch,
    setSize,
    setColor,
    setPriceRange,
    setMaterial,
    setFit,
    setStock,
    resetFilters,
  } = useFilterStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(68);
  const [fitPreference, setFitPreference] = useState<FitPreference>('Regular');
  const [openQnaIndex, setOpenQnaIndex] = useState<number | null>(0);

  useEffect(() => {
    if (!quickViewProduct) {
      return;
    }

    const firstVariant = quickViewProduct.variants[0];
    setSelectedColor(firstVariant.color);
    setSelectedSize(firstVariant.size);
    setSelectedImageIndex(0);
    setFitPreference('Regular');
    setOpenQnaIndex(0);
  }, [quickViewProduct]);

  useEffect(() => {
    if (!quickViewProduct) {
      return;
    }

    const colorMatches = quickViewProduct.variants.filter((variant) => variant.color === selectedColor);
    if (colorMatches.length === 0) {
      setSelectedColor(quickViewProduct.variants[0].color);
      return;
    }

    const hasSelectedSize = colorMatches.some((variant) => variant.size === selectedSize);
    if (!hasSelectedSize) {
      setSelectedSize(colorMatches[0].size);
    }
  }, [quickViewProduct, selectedColor, selectedSize]);

  const filteredProducts = useMemo(() => {
    const next = [...catalog].filter((product) => {
      const matchesCategory = category === 'All' || product.category === category;
      const normalizedSearch = search.trim().toLowerCase();
      const matchesSearch =
        normalizedSearch.length === 0 ||
        `${product.name} ${product.category} ${product.material} ${product.fit}`
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesSize =
        size === 'All' ||
        product.variants.some((variant) => {
          if (size === 'One Size') {
            return variant.size === 'One Size';
          }
          return variant.size === size;
        });

      const matchesColor = color === 'All' || product.variants.some((variant) => variant.color === color);
      const matchesMaterial = material === 'All' || product.material === material;
      const matchesFit = fit === 'All' || product.fit === fit;
      const matchesPrice =
        priceRange === 'All' ||
        (priceRange === 'Under $100' && product.price < 100) ||
        (priceRange === '$100-$150' && product.price >= 100 && product.price <= 150) ||
        (priceRange === '$150-$250' && product.price > 150 && product.price <= 250) ||
        (priceRange === '$250+' && product.price > 250);

      const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
      const matchesStock = stock === 'All' || (stock === 'In stock' ? totalStock > 5 : totalStock <= 5);

      return (
        matchesCategory &&
        matchesSearch &&
        matchesSize &&
        matchesColor &&
        matchesMaterial &&
        matchesFit &&
        matchesPrice &&
        matchesStock
      );
    });

    switch (sortBy) {
      case 'price-asc':
        return [...next].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...next].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...next].sort((a, b) => b.rating - a.rating);
      default:
        return [...next].sort((a, b) => b.orderHistory - a.orderHistory);
    }
  }, [category, color, fit, material, priceRange, search, size, sortBy, stock]);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return catalog.slice(0, 6);
    }

    return catalog.filter((product) => {
      const searchText = `${product.name} ${product.category} ${product.material} ${product.fit}`.toLowerCase();
      return searchText.includes(query);
    });
  }, [search]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

  const addToCart = (product: Product, variant: ProductVariant = product.variants[0]) => {
    addItem({
      id: `${product.id}-${variant.id}`,
      name: product.name,
      variantId: variant.id,
      color: variant.color,
      size: variant.size,
      price: variant.price,
      quantity: 1,
      image: variant.image,
    });
    setIsCartOpen(true);
  };

  const hasActiveFilters =
    category !== 'All' ||
    size !== 'All' ||
    color !== 'All' ||
    priceRange !== 'All' ||
    material !== 'All' ||
    fit !== 'All' ||
    stock !== 'All' ||
    search.trim() !== '';

  const activeQuickViewVariant = useMemo(() => {
    if (!quickViewProduct) {
      return null;
    }

    return (
      quickViewProduct.variants.find(
        (variant) => variant.color === selectedColor && variant.size === selectedSize,
      ) ??
      quickViewProduct.variants.find((variant) => variant.color === selectedColor) ??
      quickViewProduct.variants[0]
    );
  }, [quickViewProduct, selectedColor, selectedSize]);

  const quickViewGallery = useMemo(() => {
    if (!quickViewProduct) {
      return [];
    }

    const fallbackImages = [
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=900&q=80',
    ];

    const images = [
      activeQuickViewVariant?.image ?? quickViewProduct.variants[0].image,
      ...quickViewProduct.variants.map((variant) => variant.image),
      ...fallbackImages,
    ];

    return Array.from(new Set(images)).slice(0, 5);
  }, [activeQuickViewVariant, quickViewProduct]);

  const quickViewAverageRating = useMemo(() => {
    if (!quickViewProduct || quickViewProduct.reviews.length === 0) {
      return 0;
    }

    return (
      quickViewProduct.reviews.reduce((sum, review) => sum + review.rating, 0) /
      quickViewProduct.reviews.length
    );
  }, [quickViewProduct]);

  const quickViewSizeOptions = useMemo(() => {
    if (!quickViewProduct) {
      return [];
    }

    const sizes = Array.from(
      new Set(
        quickViewProduct.variants
          .filter((variant) => variant.color === selectedColor)
          .map((variant) => variant.size),
      ),
    );

    return sizes.map((size) => ({
      size,
      stock: quickViewProduct.variants
        .filter((variant) => variant.color === selectedColor && variant.size === size)
        .reduce((sum, variant) => sum + variant.stock, 0),
    }));
  }, [quickViewProduct, selectedColor]);

  const quickViewRecommendation = useMemo(() => {
    if (!quickViewProduct) {
      return 'M';
    }

    const score = Math.round((height / 10 + weight / 10) / 2);
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL'];
    let index = Math.min(Math.max(score - 15, 0), sizeOrder.length - 1);

    if (fitPreference === 'Slim') {
      index = Math.max(index - 1, 0);
    }
    if (fitPreference === 'Relaxed') {
      index = Math.min(index + 1, sizeOrder.length - 1);
    }

    const recommended = sizeOrder[index];
    return quickViewProduct.variants.some((variant) => variant.size === recommended)
      ? recommended
      : quickViewProduct.variants[0].size;
  }, [fitPreference, height, quickViewProduct, weight]);

  const quickViewRelatedProducts = useMemo(() => {
    if (!quickViewProduct) {
      return [];
    }

    return catalog.filter((product) => product.id !== quickViewProduct.id).slice(0, 4);
  }, [quickViewProduct]);

  return (
    <main id="main-content" className="min-h-screen px-4 py-6 text-[#1b120d] md:px-8">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-[#1b120d] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Skip to content
      </a>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#1b120d]/40 p-4 backdrop-blur-sm"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="mx-auto mt-16 max-w-3xl rounded-[30px] border border-[#ead7c9] bg-[#fffaf6]/95 p-5 shadow-[0_24px_60px_rgba(38,24,17,0.2)]"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.2rem] text-[#7d6258]">Search</p>
                  <h2 className="text-2xl font-semibold">Find your next favorite</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5e7df] text-[#1b120d]"
                  aria-label="Close search"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c655e]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by style, material, fit, or category"
                  className="w-full rounded-full border border-[#ead7c9] bg-white/80 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#a76446] focus:ring-2 focus:ring-[#a76446]/20"
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {searchResults.length > 0 ? (
                  searchResults.slice(0, 6).map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSearch(product.name);
                        setCategory(product.category);
                        setIsSearchOpen(false);
                      }}
                      className="flex items-center gap-3 rounded-[22px] border border-[#ebd5c8] bg-white p-3 text-left transition hover:border-[#a76446]/40 hover:shadow-md"
                    >
                      <Image
                        src={product.variants[0].image}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="h-16 w-16 rounded-2xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.62rem] uppercase tracking-[0.18rem] text-[#7d6258]">{product.category}</p>
                        <p className="mt-1 truncate font-medium text-[#1b120d]">{product.name}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-[#5a433b]">
                          <span>{product.material}</span>
                          <span>•</span>
                          <span>{product.fit}</span>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="sm:col-span-2 rounded-[22px] border border-dashed border-[#d9b8a3] bg-[#f7eee8] p-5 text-center text-sm text-[#5d453f]">
                    No products match that search. Try a broader term like “coat”, “wool”, or “accessories”.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {quickViewProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-[#1b120d]/40 p-4 backdrop-blur-sm"
            onClick={() => setQuickViewProduct(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
              className="mx-auto mt-8 max-w-6xl rounded-[32px] border border-[#ead7c9] bg-[#fffaf6] p-4 shadow-[0_20px_50px_rgba(39,25,18,0.18)] md:p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.2rem] text-[#7d6258]">Quick view</p>
                  <h3 className="text-3xl font-semibold">{quickViewProduct.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setQuickViewProduct(null)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5e7df] text-[#1b120d]"
                  aria-label="Close quick view"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[28px] border border-[#ead7c9] bg-[#f8f1ec]">
                    <Image
                      src={quickViewGallery[selectedImageIndex] ?? quickViewProduct.variants[0].image}
                      alt={quickViewProduct.name}
                      width={900}
                      height={1000}
                      className="h-[420px] w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {quickViewGallery.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={cn(
                          'overflow-hidden rounded-2xl border transition',
                          selectedImageIndex === index
                            ? 'border-[#a76446] shadow-sm'
                            : 'border-[#ebd5c8] bg-white',
                        )}
                      >
                        <Image
                          src={image}
                          alt={`${quickViewProduct.name} angle ${index + 1}`}
                          width={180}
                          height={180}
                          className="h-16 w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

                  <div className="overflow-hidden rounded-[28px] border border-[#ead7c9] bg-[#f9f3ee] p-3">
                    <div className="mb-3 flex items-center justify-between text-sm text-[#4a3730]">
                      <span className="font-medium">360° product view</span>
                      <span className="text-[#7d6258]">Style motion</span>
                    </div>
                    <video
                      controls
                      muted
                      loop
                      playsInline
                      className="h-48 w-full rounded-2xl object-cover bg-[#1b120d]"
                      poster={quickViewGallery[0] ?? quickViewProduct.variants[0].image}
                    >
                      <source
                        src="https://player.vimeo.com/external/449767683.sd.mp4?s=7c6d7fa854e7f9201b7d0f8c9ecf138b7c9047ec&profile_id=164&oauth2_token_id=57447761"
                        type="video/mp4"
                      />
                    </video>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 text-[#7d4d22]">
                      <Star className="h-4 w-4 fill-[#d9b15b] text-[#d9b15b]" />
                      <span className="font-medium">{quickViewAverageRating.toFixed(1)}</span>
                      <span className="text-sm text-[#6d524b]">({quickViewProduct.reviews.length} reviews)</span>
                    </div>
                    <span className="rounded-full bg-[#f5e7df] px-3 py-1 text-xs uppercase tracking-[0.16rem] text-[#734633]">
                      {quickViewProduct.badge ?? 'Popular'}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm uppercase tracking-[0.2rem] text-[#7d6258]">{quickViewProduct.category}</p>
                    <p className="mt-2 text-xl text-[#5d443d]">
                      {quickViewProduct.material} • {quickViewProduct.fit}
                    </p>
                  </div>

                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-semibold">{`${symbol}${convertPrice(activeQuickViewVariant?.price ?? quickViewProduct.price).toFixed(2)}`}</span>
                    {quickViewProduct.originalPrice && (
                      <span className="pb-1 text-lg text-[#8d7368] line-through">
                        {`${symbol}${convertPrice(quickViewProduct.originalPrice).toFixed(2)}`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-full border border-[#ead7c9] bg-[#fffaf7] px-3 py-2 text-xs uppercase tracking-[0.18rem] text-[#6a5148]">
                    <span>Selection</span>
                    <span className="font-semibold tracking-[0.12rem] text-[#1b120d]">
                      {selectedColor} / {selectedSize}
                    </span>
                  </div>

                  <div className="rounded-[24px] border border-[#ead7c9] bg-[#fffaf7] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#59443d]">Color</p>
                      <span className="text-xs uppercase tracking-[0.18rem] text-[#7d6258]">{selectedColor}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Array.from(
                        new Map(quickViewProduct.variants.map((variant) => [variant.color, variant])).values(),
                      ).map((variant) => (
                        <button
                          key={variant.color}
                          type="button"
                          onClick={() => {
                            setSelectedColor(variant.color);
                            setSelectedSize(variant.size);
                            setSelectedImageIndex(0);
                          }}
                          className={cn(
                            'flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition',
                            selectedColor === variant.color
                              ? 'border-[#a76446] bg-[#f5e7df] text-[#1b120d]'
                              : 'border-[#e5cfc0] bg-white text-[#2f2521]',
                          )}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-black/10"
                            style={{ backgroundColor: variant.accent }}
                          />
                          {variant.color}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-[#ead7c9] bg-[#fffaf7] p-4">
                    <p className="text-sm font-medium text-[#59443d]">Size</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {quickViewSizeOptions.map(({ size, stock }) => (
                        <button
                          key={size}
                          type="button"
                          disabled={stock === 0}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            'rounded-2xl border px-3 py-2 text-left transition',
                            selectedSize === size
                              ? 'border-[#a76446] bg-[#f5e7df] text-[#1b120d]'
                              : 'border-[#ebd5c8] bg-white text-[#382d29]',
                            stock === 0 && 'cursor-not-allowed opacity-40',
                          )}
                        >
                          <span className="block text-sm font-medium">{size}</span>
                          <span className="mt-1 block text-[0.62rem] uppercase tracking-[0.12rem] text-[#7d6258]">
                            {stock === 0 ? 'Sold out' : `${stock} left`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-[#ead7c9] bg-[#fffaf7] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-[#59443d]">Fit tool</p>
                      <span className="rounded-full bg-[#f5e7df] px-2 py-1 text-[0.6rem] uppercase tracking-[0.18rem] text-[#734633]">
                        {quickViewRecommendation}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="rounded-2xl border border-[#ead7c9] bg-white px-3 py-2 text-sm text-[#382d29]">
                        <span className="mb-1 block text-[0.62rem] uppercase tracking-[0.18rem] text-[#7d6258]">Height</span>
                        <input
                          type="number"
                          value={height}
                          onChange={(event) => setHeight(Number(event.target.value))}
                          className="w-full border-none bg-transparent text-base font-medium outline-none"
                        />
                      </label>
                      <label className="rounded-2xl border border-[#ead7c9] bg-white px-3 py-2 text-sm text-[#382d29]">
                        <span className="mb-1 block text-[0.62rem] uppercase tracking-[0.18rem] text-[#7d6258]">Weight</span>
                        <input
                          type="number"
                          value={weight}
                          onChange={(event) => setWeight(Number(event.target.value))}
                          className="w-full border-none bg-transparent text-base font-medium outline-none"
                        />
                      </label>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {(['Regular', 'Slim', 'Relaxed'] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setFitPreference(option)}
                          className={cn(
                            'rounded-full border px-3 py-2 text-xs transition',
                            fitPreference === option
                              ? 'border-[#a76446] bg-[#a76446] text-white'
                              : 'border-[#e7d1c3] bg-white text-[#382d29]',
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-full bg-[#f5e7df] px-3 py-2 text-xs text-[#5d433c]">
                      <span>Recommended</span>
                      <span className="font-semibold text-[#1b120d]">{quickViewRecommendation}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      className="flex-1 rounded-full bg-[#1b120d] px-5 text-white hover:bg-[#31241d]"
                      onClick={() => addToCart(quickViewProduct, activeQuickViewVariant ?? quickViewProduct.variants[0])}
                    >
                      Add to bag
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => toggleSaved(quickViewProduct.id)}>
                      {savedIds.includes(quickViewProduct.id) ? 'Saved' : 'Save'}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
                <div className="rounded-[28px] border border-[#ead7c9] bg-[#fffaf7] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-[#59443d]">Verified reviews</p>
                    <span className="rounded-full bg-[#fff0de] px-2.5 py-1 text-xs font-medium text-[#7d4d22]">
                      {quickViewAverageRating.toFixed(1)} / 5
                    </span>
                  </div>

                  <div className="space-y-3">
                    {quickViewProduct.reviews.map((review) => (
                      <div key={review.id} className="rounded-[22px] border border-[#ebd5c8] bg-white p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-[#1b120d]">{review.author}</p>
                          {review.verified && (
                            <span className="rounded-full bg-[#edf8f1] px-2 py-1 text-[0.6rem] uppercase tracking-[0.15rem] text-[#2c7c59]">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-1 text-[#d9b15b]">
                          {[...Array(5)].map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              className={cn(
                                'h-3.5 w-3.5',
                                starIndex < review.rating ? 'fill-current' : 'text-[#d4bfaf]',
                              )}
                            />
                          ))}
                        </div>
                        <p className="mt-2 text-sm text-[#5d443d]">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#ead7c9] bg-[#fffaf7] p-5">
                  <p className="text-sm font-medium text-[#59443d]">Q&A</p>
                  <div className="mt-4 space-y-3">
                    {[
                      {
                        question: 'Will this work for a layered winter fit?',
                        answer:
                          'Yes — the Relaxed fit drapes well over knits and shirts, and the wool and cotton blends handle layering without feeling bulky.',
                      },
                      {
                        question: 'How does the size compare to everyday essentials?',
                        answer:
                          'This piece runs true to size for most people. For a clean, tailored silhouette, choose the Slim option; for ease, go one size up.',
                      },
                      {
                        question: 'What is the fabric feel in practice?',
                        answer:
                          'The finish is substantial but breathable, with a soft touch on the inside and a crisp structure on the outside to keep the silhouette polished.',
                      },
                    ].map((entry, index) => (
                      <div key={entry.question} className="overflow-hidden rounded-[20px] border border-[#ebd5c8] bg-white">
                        <button
                          type="button"
                          onClick={() => setOpenQnaIndex(openQnaIndex === index ? null : index)}
                          className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm font-medium text-[#1b120d]"
                        >
                          {entry.question}
                          <span className="text-[#7d6258]">{openQnaIndex === index ? '−' : '+'}</span>
                        </button>
                        {openQnaIndex === index && (
                          <p className="border-t border-[#f0e3db] px-3 py-3 text-sm text-[#5d443d]">{entry.answer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[28px] border border-[#ead7c9] bg-[#fffaf7] p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.24rem] text-[#7d6258]">Wear it with</p>
                    <h4 className="mt-1 text-2xl font-semibold">Complete the look</h4>
                  </div>
                  <button type="button" className="text-sm font-medium text-[#a76446]" onClick={() => setQuickViewProduct(null)}>
                    Shop the set
                  </button>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2">
                  {quickViewRelatedProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      className="group min-w-[220px] overflow-hidden rounded-[22px] border border-[#ebd5c8] bg-white p-2 text-left transition hover:border-[#a76446]/40 hover:shadow-md"
                      onClick={() => setQuickViewProduct(product)}
                    >
                      <Image
                        src={product.variants[0].image}
                        alt={product.name}
                        width={240}
                        height={300}
                        className="h-52 w-full rounded-[18px] object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="mt-3">
                        <p className="text-[0.62rem] uppercase tracking-[0.18rem] text-[#7d6258]">{product.category}</p>
                        <p className="mt-1 font-medium text-[#1b120d]">{product.name}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-semibold">{`${symbol}${convertPrice(product.price).toFixed(2)}`}</span>
                          <ArrowRight className="h-4 w-4 text-[#a76446]" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#1b120d]/35 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              onClick={(event) => event.stopPropagation()}
              className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-[#fffaf6] p-5 shadow-[0_30px_80px_rgba(27,18,13,0.25)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.22rem] text-[#7d6258]">Your bag</p>
                  <h2 className="text-2xl font-semibold text-[#1b120d]">Cart</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f5e7df] text-[#1b120d]"
                  aria-label="Close shopping cart"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 rounded-[24px] bg-[#1b120d] p-4 text-[#f8f1eb]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[0.64rem] uppercase tracking-[0.18rem] text-[#d8c2b9]">Shipping progress</p>
                    <p className="mt-1 text-2xl font-semibold">{formatCurrency(subtotal, currency)}</p>
                  </div>
                  <div className="rounded-full bg-[#f6e4d9] p-2 text-[#1b120d]">
                    <Truck className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-[#efbf9d] transition-all duration-300"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
                <p className="mt-3 text-xs text-[#f0d9cc]">
                  {subtotal >= freeShippingThreshold
                    ? 'Free shipping unlocked'
                    : `${formatCurrency(remainingForFreeShipping, currency)} left for free shipping`}
                </p>
              </div>

              {cartItems.length === 0 ? (
                <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-[28px] border border-dashed border-[#e7d1c3] bg-[#fffaf7] p-6 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5e7df] text-[#1b120d]">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1b120d]">Your bag is empty</h3>
                  <p className="mt-2 max-w-xs text-sm text-[#5d443d]">
                    Add a few essentials and we’ll keep your shipping progress visible right here.
                  </p>
                </div>
              ) : (
                <div className="mt-6 flex-1 space-y-3 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[22px] border border-[#ebd5c8] bg-white p-3 shadow-[0_12px_22px_rgba(33,24,19,0.04)]"
                    >
                      <div className="flex gap-3">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={90}
                          height={110}
                          className="h-24 w-24 rounded-[18px] object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="truncate font-medium text-[#1b120d]">{item.name}</p>
                              <p className="mt-1 text-xs text-[#6a5148]">
                                {item.color} • {item.size}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-xs font-medium text-[#8d5a47]"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 rounded-full bg-[#f5e7df] px-2 py-1.5">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm text-[#1b120d]"
                                aria-label={`Decrease quantity for ${item.name}`}
                              >
                                −
                              </button>
                              <span className="min-w-4 text-center text-sm font-medium text-[#1b120d]">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm text-[#1b120d]"
                                aria-label={`Increase quantity for ${item.name}`}
                              >
                                +
                              </button>
                            </div>
                            <span className="text-sm font-semibold text-[#1b120d]">
                              {formatCurrency(item.price * item.quantity, currency)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 rounded-[24px] border border-[#ead7c9] bg-[#fffaf7] p-4">
                <div className="space-y-3 text-sm text-[#4a3730]">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-[#1b120d]">{formatCurrency(subtotal, currency)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span className="font-medium text-[#1b120d]">
                      {subtotal >= freeShippingThreshold ? 'Free' : formatCurrency(5, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Estimated tax</span>
                    <span className="font-medium text-[#1b120d]">{formatCurrency(subtotal * 0.08, currency)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#ead7c9] pt-3 text-base font-semibold text-[#1b120d]">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal + (subtotal >= freeShippingThreshold ? 0 : 5) + subtotal * 0.08, currency)}</span>
                </div>

                {promoCodes.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {promoCodes.map((code) => (
                      <div key={code} className="flex items-center justify-between rounded-full bg-[#f5e7df] px-3 py-2 text-xs text-[#4a3730]">
                        <span>{code}</span>
                        <button type="button" onClick={() => removePromo(code)} className="text-[#a76446]">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button className="mt-5 w-full rounded-full bg-[#1b120d] text-white hover:bg-[#31241d]">
                Proceed to checkout
              </Button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl">
        <header className="glass-panel sticky top-4 z-30 flex items-center justify-between gap-4 rounded-full px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b120d] text-sm font-semibold text-[#f8f1eb]">
              AN
            </div>
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.28rem] text-[#7d6258]">Atelier</p>
              <h1 className="text-display text-xl font-semibold">North</h1>
            </div>
          </div>

          <nav className="hidden items-center gap-2 text-sm text-[#43352f] md:flex">
            {navItems.map((item) => (
              <div key={item.name} className="group relative">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full px-3 py-2 transition hover:bg-[#f5e7df]"
                >
                  {item.name}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <div className="invisible absolute left-0 top-full z-20 mt-2 w-48 rounded-[22px] border border-[#ebd5c8] bg-[#fffaf6] p-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  {item.subitems.map((subitem) => (
                    <a
                      key={subitem}
                      href="#"
                      className="block rounded-full px-3 py-2 text-sm text-[#43352f] transition hover:bg-[#f5e7df]"
                    >
                      {subitem}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-full border border-[#ead7c9] bg-[#fffaf6]/80 p-1">
              {(['customer', 'admin'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    'rounded-full px-3 py-2 text-xs font-medium uppercase tracking-[0.18rem] transition-colors',
                    viewMode === mode
                      ? 'bg-[#1b120d] text-white'
                      : 'text-[#5d443d] hover:bg-[#f5e7df]',
                  )}
                  aria-pressed={viewMode === mode}
                >
                  {mode === 'customer' ? 'Customer portal' : 'Admin dashboard'}
                </button>
              ))}
            </div>

            <Select value={currency} onValueChange={(value) => setCurrency(value as typeof currency)}>
              <SelectTrigger className="w-[118px] bg-white/60" aria-label="Select currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" aria-label="Search products" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              className="gap-2 rounded-full"
              aria-label="Open shopping bag"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </Button>
          </div>
        </header>

        {viewMode === 'admin' && (
          <section className="mt-8 glass-panel rounded-[32px] p-5 md:p-6" aria-label="Admin dashboard overview">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24rem] text-[#7d6258]">Operations</p>
                <h2 className="mt-1 text-3xl font-semibold text-[#1b120d]">Admin dashboard</h2>
              </div>
              <span className="inline-flex items-center rounded-full bg-[#edf7f0] px-3 py-1 text-xs font-medium text-[#2d6b47]">
                Live + 12% vs last week
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Revenue', value: '$182.4K', change: '+18.2%' },
                { label: 'Average CV', value: '$1,240', change: '+6.4%' },
                { label: 'Conversion rate', value: '4.6%', change: '+0.6%' },
                { label: 'Stock velocity', value: '92%', change: '+11%' },
              ].map((metric) => (
                <div key={metric.label} className="rounded-[24px] border border-[#ebd5c8] bg-[#fffaf7] p-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.22rem] text-[#7d6258]">{metric.label}</p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="text-3xl font-semibold text-[#1b120d]">{metric.value}</p>
                    <span className="rounded-full bg-[#edf7f0] px-2 py-1 text-[0.62rem] font-medium text-[#2d6b47]">
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="rounded-[28px] border border-[#ebd5c8] bg-[#fffaf7] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-[#1b120d]">Revenue trend</h3>
                  <span className="text-sm text-[#5d443d]">Last 7 days</span>
                </div>
                <div className="flex h-40 items-end gap-3">
                  {[42, 58, 46, 72, 88, 74, 95].map((value, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className="w-full rounded-t-[16px] bg-gradient-to-t from-[#a76446] to-[#efbf9d]"
                        style={{ height: `${value}%` }}
                        aria-label={`Revenue bar ${index + 1}`}
                      />
                      <span className="text-[0.62rem] uppercase tracking-[0.16rem] text-[#7d6258]">
                        {['M','T','W','T','F','S','S'][index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#ebd5c8] bg-[#fffaf7] p-4">
                <h3 className="text-xl font-semibold text-[#1b120d]">Low-stock alerts</h3>
                <ul className="mt-4 space-y-3">
                  {[
                    { name: 'Monarch Wool Coat', sku: 'MWC-204', qty: 4 },
                    { name: 'Summit Zip Hoodie', sku: 'SZH-118', qty: 6 },
                    { name: 'Lune Utility Shirt', sku: 'LUS-312', qty: 8 },
                  ].map((item) => (
                    <li key={item.sku} className="flex items-center justify-between rounded-full bg-[#f5e7df] px-3 py-2 text-sm text-[#382d29]">
                      <span>
                        <span className="font-medium">{item.name}</span>
                        <span className="ml-2 text-[#7d6258]">{item.sku}</span>
                      </span>
                      <span className="rounded-full bg-[#fff2e7] px-2 py-1 text-[0.62rem] font-semibold text-[#a76446]">
                        {item.qty} left
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[28px] border border-[#ebd5c8] bg-[#fffaf7] p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-[#1b120d]">Inventory & order management</h3>
                  <button type="button" className="text-sm font-medium text-[#a76446]">Export</button>
                </div>

                <div className="overflow-hidden rounded-[20px] border border-[#ebd5c8]">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-[#f5e7df] text-[#59443d]">
                      <tr>
                        <th className="px-3 py-2 font-medium">Product</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Units</th>
                        <th className="px-3 py-2 font-medium">Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ['Monarch Wool Coat', 'Processing', '287', '18'],
                        ['Atelier Knit Sweater', 'Shipped', '112', '9'],
                        ['Harbor Canvas Tote', 'Delivered', '94', '13'],
                        ['Lune Utility Shirt', 'Pending', '32', '5'],
                      ].map(([product, status, units, orders]) => (
                        <tr key={product} className="border-t border-[#ebd5c8] bg-white/70">
                          <td className="px-3 py-2 font-medium text-[#1b120d]">{product}</td>
                          <td className="px-3 py-2">
                            <span className="rounded-full bg-[#edf7f0] px-2 py-1 text-[0.62rem] font-medium text-[#2d6b47]">
                              {status}
                            </span>
                          </td>
                          <td className="px-3 py-2">{units}</td>
                          <td className="px-3 py-2">{orders}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[28px] border border-[#ebd5c8] bg-[#fffaf7] p-4">
                  <h3 className="text-xl font-semibold text-[#1b120d]">Promo builder</h3>
                  <div className="mt-4 flex gap-2">
                    <input
                      aria-label="Promo code name"
                      defaultValue="SPRING10"
                      className="w-full rounded-full border border-[#e7d1c3] bg-white px-3 py-2 text-sm text-[#1b120d] outline-none focus:border-[#a76446]"
                    />
                    <button type="button" className="rounded-full bg-[#1b120d] px-3 py-2 text-sm font-medium text-white">
                      Save
                    </button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#ebd5c8] bg-[#fffaf7] p-4">
                  <h3 className="text-xl font-semibold text-[#1b120d]">Abandoned cart</h3>
                  <ul className="mt-4 space-y-2 text-sm text-[#5d443d]">
                    <li>• Reminder after 2 hours</li>
                    <li>• 10% off for cart values over $200</li>
                    <li>• SMS + email sequence</li>
                  </ul>
                </div>

                <div className="rounded-[28px] border border-[#ebd5c8] bg-[#fffaf7] p-4">
                  <h3 className="text-xl font-semibold text-[#1b120d]">Thermal labels</h3>
                  <div className="mt-4 rounded-[18px] border border-dashed border-[#d9b8a3] bg-[#f8f1eb] p-3 text-sm text-[#382d29]">
                    <p className="font-medium">Order #AK-2418</p>
                    <p className="mt-2">To: Alicia Brooks</p>
                    <p>Ship by: 02:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="glass-panel hidden rounded-[30px] p-5 lg:block">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.22rem] text-[#7d6258]">Filters</p>
                <h2 className="text-2xl font-semibold">Curated edit</h2>
              </div>
              <button type="button" className="rounded-full border border-[#ebd7c9] p-2 text-[#1b120d]">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5">
              <FilterChipGroup
                label="Category"
                options={[...categoryOptions]}
                selected={category}
                onSelect={(value) => setCategory(value as typeof category)}
              />
              <FilterChipGroup
                label="Size"
                options={[...sizeOptions]}
                selected={size}
                onSelect={(value) => setSize(value as typeof size)}
              />
              <FilterChipGroup
                label="Color"
                options={[...colorOptions]}
                selected={color}
                onSelect={(value) => setColor(value)}
              />
              <FilterChipGroup
                label="Price"
                options={[...priceOptions]}
                selected={priceRange}
                onSelect={(value) => setPriceRange(value as typeof priceRange)}
              />
              <FilterChipGroup
                label="Material"
                options={[...materialOptions]}
                selected={material}
                onSelect={(value) => setMaterial(value)}
              />
              <FilterChipGroup
                label="Fit"
                options={[...fitOptions]}
                selected={fit}
                onSelect={(value) => setFit(value as typeof fit)}
              />
              <FilterChipGroup
                label="Stock status"
                options={[...stockOptions]}
                selected={stock}
                onSelect={(value) => setStock(value as typeof stock)}
              />

              <button
                type="button"
                onClick={() => resetFilters()}
                className={cn(
                  'w-full rounded-full border border-[#e7d1c3] bg-white/70 px-3 py-2 text-sm text-[#382d29] transition hover:border-[#a76446] hover:text-[#a76446]',
                  !hasActiveFilters && 'opacity-60',
                )}
              >
                Reset filters
              </button>
            </div>

            <div className="mt-8 rounded-[24px] bg-[#1a120f] p-4 text-[#f8f1eb]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.18rem] text-[#d7c2b7]">Bag total</p>
                  <p className="mt-1 text-2xl font-semibold">{formatCurrency(subtotal, currency)}</p>
                </div>
                <div className="rounded-full bg-[#f6e4d9] p-2 text-[#1a120f]">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-2 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-[#efbf9d] transition-all duration-300"
                    style={{ width: `${shippingProgress}%` }}
                  />
                </div>
                <p className="text-xs text-[#f0d9cc]">
                  {subtotal >= freeShippingThreshold
                    ? 'Free shipping unlocked'
                    : `${formatCurrency(remainingForFreeShipping, currency)} left for free shipping`}
                </p>
              </div>

              <div className="mt-5 space-y-2">
                {promoCodes.map((code) => (
                  <div key={code} className="flex items-center justify-between rounded-full bg-white/10 px-3 py-2 text-xs text-[#f4ebe7]">
                    <span>{code}</span>
                    <button type="button" onClick={() => removePromo(code)} className="text-[#f5ceb1]">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel overflow-hidden rounded-[32px] p-6 md:p-8"
            >
              <div className="grid items-center gap-6 md:grid-cols-[1.25fr_0.75fr]">
                <div>
                  <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#f5e7df] px-3 py-1 text-[0.62rem] uppercase tracking-[0.22rem] text-[#734633]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Everyday luxury
                  </p>
                  <h2 className="text-display text-4xl font-semibold leading-tight md:text-5xl">
                    Thoughtful pieces for the rhythm of real life.
                  </h2>
                  <p className="mt-4 max-w-xl text-base text-[#5a433b]">
                    Refined basics, soft structure, and flexible layering built for workdays, weekends,
                    and everything in between.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button className="rounded-full bg-[#1b120d] text-white hover:bg-[#31241d]">
                      Shop the edit
                    </Button>
                    <Button variant="outline" className="rounded-full">
                      View lookbook
                    </Button>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[28px] bg-[#f2ded1] p-4">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.8),_transparent_45%)]" />
                  <Image
                    src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80"
                    alt="Editorial fashion portrait"
                    width={900}
                    height={1000}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="relative z-10 h-[320px] w-full rounded-[22px] object-cover"
                    priority
                  />
                </div>
              </div>
            </motion.section>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="glass-panel rounded-[24px] p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.24rem] text-[#7d6258]">Best sellers</p>
                <p className="mt-2 text-2xl font-semibold">248</p>
                <p className="text-sm text-[#5e4d47]">orders this month</p>
              </div>
              <div className="glass-panel rounded-[24px] p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.24rem] text-[#7d6258]">Avg. rating</p>
                <p className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                  <Star className="h-5 w-5 fill-[#d9b15b] text-[#d9b15b]" />
                  4.8
                </p>
                <p className="text-sm text-[#5e4d47]">from verified buyers</p>
              </div>
              <div className="glass-panel rounded-[24px] p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.24rem] text-[#7d6258]">Fast shipping</p>
                <p className="mt-2 flex items-center gap-2 text-2xl font-semibold">
                  <Truck className="h-5 w-5 text-[#3f7d5b]" />
                  48h
                </p>
                <p className="text-sm text-[#5e4d47]">on featured essentials</p>
              </div>
            </div>

            <section className="glass-panel rounded-[32px] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.24rem] text-[#7d6258]">Your bag</p>
                  <h3 className="mt-1 text-2xl font-semibold">Ready to ship</h3>
                </div>
                <span className="rounded-full bg-[#f5e7df] px-3 py-1 text-xs font-medium text-[#734633]">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </div>

              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-[22px] border border-[#ebd5c8] bg-white/80 p-3">
                    <Image src={item.image} alt={item.name} width={64} height={64} className="h-16 w-16 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[#1b120d]">{item.name}</p>
                      <p className="text-xs text-[#6a5148]">
                        {item.color} • {item.size}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5e7df] text-sm text-[#1b120d]"
                        aria-label={`Decrease quantity for ${item.name}`}
                      >
                        −
                      </button>
                      <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5e7df] text-sm text-[#1b120d]"
                        aria-label={`Increase quantity for ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-xs font-medium text-[#8d5a47]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[32px] bg-[#f8f1eb] p-4 md:p-6">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.22rem] text-[#7d6258]">Shop the collection</p>
                  <h3 className="mt-1 text-3xl font-semibold">Hero essentials</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFilterDrawerOpen(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-[#e7d1c3] bg-white/80 px-3 py-2 text-sm text-[#382d29] lg:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </button>
                  <p className="text-sm text-[#5a433b]">{filteredProducts.length} styles</p>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-[#59443d]">
                  <span className="font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                    className="rounded-full border border-[#e7d1c3] bg-white px-3 py-2 text-sm outline-none focus:border-[#a76446]"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: Low to high</option>
                    <option value="price-desc">Price: High to low</option>
                    <option value="rating">Top rated</option>
                  </select>
                </div>
                {hasActiveFilters && (
                  <button type="button" onClick={() => resetFilters()} className="text-sm font-medium text-[#a76446]">
                    Clear all
                  </button>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const variant = product.variants[0];
                  const isSaved = savedIds.includes(product.id);
                  const isAlerted = alertIds.includes(product.id);
                  const formattedPrice = `${symbol}${convertPrice(product.price).toFixed(2)}`;
                  const stockStatus = getStockStatus(product);

                  return (
                    <motion.article
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="overflow-hidden rounded-[28px] border border-[#ebd5c8] bg-white p-3 shadow-[0_18px_32px_rgba(44,29,22,0.05)]"
                    >
                      <div className="relative overflow-hidden rounded-[22px] bg-[#f6ece6]">
                        <Image
                          src={variant.image}
                          alt={product.name}
                          width={600}
                          height={720}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          loading="lazy"
                          className="h-72 w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                        />
                        {product.badge && (
                          <span className="absolute left-3 top-3 rounded-full bg-[#1b120d] px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.16rem] text-white">
                            {product.badge}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleSaved(product.id)}
                          aria-label="Toggle wishlist"
                          className={cn(
                            'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/75 backdrop-blur-sm transition',
                            isSaved ? 'text-[#a76446]' : 'text-[#1b120d]',
                          )}
                        >
                          <Heart className={cn('h-4 w-4', isSaved && 'fill-current')} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.18rem] text-[#7d6258]">{product.category}</p>
                          <h4 className="mt-1 text-xl font-semibold">{product.name}</h4>
                        </div>
                        <div className="flex items-center gap-1 rounded-full bg-[#fff5e7] px-2 py-1 text-xs font-medium text-[#7d4d22]">
                          <Star className="h-3.5 w-3.5 fill-[#d9b15b] text-[#d9b15b]" />
                          {product.rating}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm text-[#5c433b]">
                        <span>{product.material}</span>
                        <span>{product.fit}</span>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-semibold">{formattedPrice}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-[#8d7368] line-through">
                              {`${symbol}${convertPrice(product.originalPrice).toFixed(2)}`}
                            </span>
                          )}
                        </div>
                        <Button variant="secondary" size="sm" className="rounded-full" onClick={() => addToCart(product)}>
                          Add to bag
                        </Button>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-[#6f514a]">
                        <span>{product.orderHistory} sold</span>
                        <span className={cn('font-medium', stockStatus === 'Low stock' ? 'text-[#b55d46]' : 'text-[#3f7d5b]')}>
                          {stockStatus}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-[#f0e2d9] pt-3 text-xs text-[#6f514a]">
                        <button type="button" onClick={() => toggleAlert(product.id)} className="underline decoration-dotted">
                          {isAlerted ? 'Alerts enabled' : 'Notify me'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuickViewProduct(product)}
                          className="inline-flex items-center gap-1 font-medium text-[#1b120d]"
                        >
                          Quick view <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </section>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {isFilterDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#1b120d]/35 lg:hidden"
            onClick={() => setIsFilterDrawerOpen(false)}
          >
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              onClick={(event) => event.stopPropagation()}
              className="absolute right-0 top-0 h-full w-[90%] max-w-sm overflow-y-auto bg-[#fffaf6] p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.2rem] text-[#7d6258]">Filters</p>
                  <h3 className="text-2xl font-semibold">Curated edit</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5e7df]"
                  aria-label="Close filters"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 space-y-5">
                <FilterChipGroup
                  label="Category"
                  options={[...categoryOptions]}
                  selected={category}
                  onSelect={(value) => setCategory(value as typeof category)}
                />
                <FilterChipGroup
                  label="Size"
                  options={[...sizeOptions]}
                  selected={size}
                  onSelect={(value) => setSize(value as typeof size)}
                />
                <FilterChipGroup
                  label="Color"
                  options={[...colorOptions]}
                  selected={color}
                  onSelect={(value) => setColor(value)}
                />
                <FilterChipGroup
                  label="Price"
                  options={[...priceOptions]}
                  selected={priceRange}
                  onSelect={(value) => setPriceRange(value as typeof priceRange)}
                />
                <FilterChipGroup
                  label="Material"
                  options={[...materialOptions]}
                  selected={material}
                  onSelect={(value) => setMaterial(value)}
                />
                <FilterChipGroup
                  label="Fit"
                  options={[...fitOptions]}
                  selected={fit}
                  onSelect={(value) => setFit(value as typeof fit)}
                />
                <FilterChipGroup
                  label="Stock status"
                  options={[...stockOptions]}
                  selected={stock}
                  onSelect={(value) => setStock(value as typeof stock)}
                />
                <button
                  type="button"
                  onClick={() => {
                    resetFilters();
                    setIsFilterDrawerOpen(false);
                  }}
                  className="w-full rounded-full border border-[#e7d1c3] bg-white/70 px-3 py-2 text-sm text-[#382d29]"
                >
                  Reset filters
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
