'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  Heart,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Star,
  Truck,
} from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { catalog } from '@/lib/mock-data';
import { cn, formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/stores/cart-store';
import { useCurrencyStore } from '@/stores/currency-store';
import { useFilterStore } from '@/stores/filter-store';
import { useWishlistStore } from '@/stores/wishlist-store';

const categoryOptions = ['All', 'Men', 'Women', 'Accessories', 'Sale'] as const;

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

  const category = useFilterStore((state) => state.category);
  const sortBy = useFilterStore((state) => state.sortBy);
  const search = useFilterStore((state) => state.search);
  const setCategory = useFilterStore((state) => state.setCategory);
  const setSortBy = useFilterStore((state) => state.setSortBy);
  const setSearch = useFilterStore((state) => state.setSearch);

  const filteredProducts = useMemo(() => {
    const next = [...catalog].filter((product) => {
      const matchesCategory = category === 'All' || product.category === category;
      const searchText = `${product.name} ${product.category} ${product.material} ${product.fit}`.toLowerCase();
      const matchesSearch = searchText.includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    switch (sortBy) {
      case 'price-asc':
        return next.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return next.sort((a, b) => b.price - a.price);
      case 'rating':
        return next.sort((a, b) => b.rating - a.rating);
      default:
        return next.sort((a, b) => b.orderHistory - a.orderHistory);
    }
  }, [category, search, sortBy]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShipping = Math.max(freeShippingThreshold - subtotal, 0);

  const addToCart = (product: (typeof catalog)[number]) => {
    const variant = product.variants[0];
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
  };

  return (
    <main className="min-h-screen px-4 py-6 text-[#1b120d] md:px-8">
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

          <nav className="hidden items-center gap-6 text-sm text-[#43352f] md:flex">
            <a href="#">New Arrivals</a>
            <a href="#">Men</a>
            <a href="#">Women</a>
            <a href="#">Accessories</a>
            <a href="#">Sale</a>
          </nav>

          <div className="flex items-center gap-3">
            <Select value={currency} onValueChange={(value) => setCurrency(value as typeof currency)}>
              <SelectTrigger className="w-[118px] bg-white/60">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="JPY">JPY</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" aria-label="Search products">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="secondary" className="gap-2 rounded-full">
              <ShoppingBag className="h-4 w-4" />
              <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </Button>
          </div>
        </header>

        <section className="mt-8 grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="glass-panel rounded-[30px] p-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.22rem] text-[#7d6258]">Filters</p>
                <h2 className="text-2xl font-semibold">Curated edit</h2>
              </div>
              <button className="rounded-full border border-[#ebd7c9] p-2 text-[#1b120d]">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <p className="mb-3 text-sm font-medium text-[#59443d]">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCategory(option)}
                      className={cn(
                        'rounded-full border px-3 py-2 text-xs transition-all',
                        category === option
                          ? 'border-[#a76446] bg-[#a76446] text-white'
                          : 'border-[#e7d1c3] bg-white/60 text-[#382d29]',
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-[#59443d]">Sort</p>
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                  <SelectTrigger className="bg-white/60">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to high</SelectItem>
                    <SelectItem value="price-desc">Price: High to low</SelectItem>
                    <SelectItem value="rating">Top rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-[#59443d]">Search</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7c655e]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search styles"
                    className="w-full rounded-full border border-[#ead7c9] bg-white/80 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#a76446] focus:ring-2 focus:ring-[#a76446]/20"
                  />
                </div>
              </div>
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
                    <button onClick={() => removePromo(code)} className="text-[#f5ceb1]">
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
                <p className="text-sm text-[#5a433b]">{filteredProducts.length} styles</p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const variant = product.variants[0];
                  const isSaved = savedIds.includes(product.id);
                  const isAlerted = alertIds.includes(product.id);
                  const formattedPrice = `${symbol}${convertPrice(product.price).toFixed(2)}`;

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
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-full"
                          onClick={() => addToCart(product)}
                        >
                          Add to bag
                        </Button>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs text-[#6f514a]">
                        <span>{product.orderHistory} sold</span>
                        <button type="button" onClick={() => toggleAlert(product.id)} className="underline decoration-dotted">
                          {isAlerted ? 'Alerts enabled' : 'Notify me'}
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
    </main>
  );
}
