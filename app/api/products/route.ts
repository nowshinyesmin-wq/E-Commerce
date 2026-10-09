import { NextResponse } from 'next/server';

import type { Product } from '@/lib/mock-data';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const categories = {
  MEN: 'Men',
  WOMEN: 'Women',
  ACCESSORIES: 'Accessories',
  SALE: 'Sale',
} as const;

function parseFit(value: string): Product['fit'] {
  switch (value) {
    case 'Regular':
    case 'Slim':
    case 'Relaxed':
      return value;
    default:
      throw new Error(`Unsupported product fit value in PostgreSQL: ${value}`);
  }
}

export async function GET() {
  try {
    const records = await prisma.product.findMany({
      include: {
        variants: true,
        reviews: true,
      },
      orderBy: {
        orderHistory: 'desc',
      },
    });

    const products: Product[] = records.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: categories[product.category],
      material: product.material,
      fit: parseFit(product.fit),
      price: Number(product.price),
      ...(product.originalPrice === null
        ? {}
        : { originalPrice: Number(product.originalPrice) }),
      rating: product.rating,
      image: product.image,
      accent: product.accent,
      ...(product.badge === null ? {} : { badge: product.badge }),
      orderHistory: product.orderHistory,
      variants: product.variants.map((variant) => ({
        id: variant.id,
        color: variant.color,
        size: variant.size,
        price: Number(variant.price),
        stock: variant.stock,
        image: variant.image,
        accent: variant.accent,
      })),
      reviews: product.reviews.map((review) => ({
        id: review.id,
        author: review.author,
        rating: review.rating,
        comment: review.comment,
        verified: review.verified,
      })),
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to load products from PostgreSQL:', error);
    return NextResponse.json(
      { error: 'The product catalog is temporarily unavailable.' },
      { status: 503 },
    );
  }
}
