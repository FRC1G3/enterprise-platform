import "dotenv/config";

import prisma from "../lib/db/prisma";
import { products } from "../lib/mock-data";

const categoryMap = {
  Men: "MEN",
  Women: "WOMEN",
  Shoes: "SHOES",
  Accessories: "ACCESSORIES",
} as const;

async function main() {
  for (const product of products) {
    const savedProduct = await prisma.product.upsert({
      where: {
        slug: product.slug,
      },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        category: categoryMap[product.category],
        sku: product.sku,
        image: product.image,
        images: product.images,
        colors: product.colors,
        sizes: product.sizes,
        rating: product.rating,
        reviewCount: product.reviewCount,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        isActive: true,
      },
      create: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice ?? null,
        category: categoryMap[product.category],
        sku: product.sku,
        image: product.image,
        images: product.images,
        colors: product.colors,
        sizes: product.sizes,
        rating: product.rating,
        reviewCount: product.reviewCount,
        isFeatured: product.isFeatured,
        isNew: product.isNew,
        isActive: true,
      },
    });

    await prisma.inventory.upsert({
      where: {
        productId: savedProduct.id,
      },
      update: {
        quantity: product.stock,
        reservedQuantity: 0,
      },
      create: {
        productId: savedProduct.id,
        quantity: product.stock,
        reservedQuantity: 0,
      },
    });
  }

  console.log(`${products.length} products seeded successfully.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });