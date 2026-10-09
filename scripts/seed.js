const { PrismaClient } = require('@prisma/client');
const catalog = require('../lib/catalog.json');

const prisma = new PrismaClient();
const categories = {
  Men: 'MEN',
  Women: 'WOMEN',
  Accessories: 'ACCESSORIES',
  Sale: 'SALE',
};

async function main() {
  for (const product of catalog) {
    const productData = {
      slug: product.slug,
      name: product.name,
      category: categories[product.category],
      material: product.material,
      fit: product.fit,
      price: product.price,
      originalPrice: product.originalPrice,
      rating: product.rating,
      image: product.image,
      accent: product.accent,
      badge: product.badge,
      orderHistory: product.orderHistory,
    };

    await prisma.product.upsert({
      where: { slug: product.slug },
      create: {
        id: product.id,
        ...productData,
        variants: {
          create: product.variants,
        },
        reviews: {
          create: product.reviews,
        },
      },
      update: productData,
    });

    for (const variant of product.variants) {
      await prisma.productVariant.upsert({
        where: { id: variant.id },
        create: { ...variant, productId: product.id },
        update: { ...variant, productId: product.id },
      });
    }

    for (const review of product.reviews) {
      await prisma.review.upsert({
        where: { id: review.id },
        create: { ...review, productId: product.id },
        update: { ...review, productId: product.id },
      });
    }
  }

  console.log(`Seeded ${catalog.length} products with their variants and reviews.`);
}

main()
  .catch((error) => {
    console.error('Database seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
