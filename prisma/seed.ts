import "dotenv/config";

import {
  ProductCategory,
  UserRole,
} from "../generated/prisma/client";

import { hashPassword } from "../lib/auth/password";
import prisma from "../lib/db/prisma";
import { products } from "../lib/mock-data";

const categoryMap = {
  Men: ProductCategory.MEN,
  Women: ProductCategory.WOMEN,
  Shoes: ProductCategory.SHOES,
  Accessories: ProductCategory.ACCESSORIES,
} as const;

const demoUsers = [
  {
    name: "Nova User",
    email: "user@novastore.com",
    password: "password123",
    role: UserRole.USER,
  },
  {
    name: "Ava Admin",
    email: "admin@novastore.com",
    password: "admin123",
    role: UserRole.ADMIN,
  },
] as const;

async function seedUsers() {
  for (const demoUser of demoUsers) {
    const passwordHash = await hashPassword(
      demoUser.password,
    );

    const user = await prisma.user.upsert({
      where: {
        email: demoUser.email,
      },
      update: {
        name: demoUser.name,
        passwordHash,
        role: demoUser.role,
        isActive: true,
      },
      create: {
        name: demoUser.name,
        email: demoUser.email,
        passwordHash,
        role: demoUser.role,
        isActive: true,
      },
    });

    await prisma.cart.upsert({
      where: {
        userId: user.id,
      },
      update: {},
      create: {
        userId: user.id,
      },
    });
  }
}

async function seedProducts() {
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
}

async function main() {
  await seedUsers();
  await seedProducts();

  console.log(
    `${demoUsers.length} users and ${products.length} products seeded successfully.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });