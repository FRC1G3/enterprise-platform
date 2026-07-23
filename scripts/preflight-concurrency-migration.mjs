import "dotenv/config";

import pg from "pg";

const client = new pg.Client({
  connectionString:
    process.env.DATABASE_URL,
});

await client.connect();

try {
  const result = await client.query(`
    SELECT
      (
        SELECT COUNT(*)
        FROM "Inventory"
        WHERE "quantity" < 0
          OR "reservedQuantity" < 0
          OR "reservedQuantity" > "quantity"
      ) AS invalid_inventory,
      (
        SELECT COUNT(*)
        FROM "CartItem"
        WHERE "quantity" <= 0
      ) AS invalid_cart_items,
      (
        SELECT COUNT(*)
        FROM "OrderItem"
        WHERE "quantity" <= 0
          OR "unitPrice" < 0
          OR "totalPrice" < 0
      ) AS invalid_order_items,
      (
        SELECT COUNT(*)
        FROM "Order"
        WHERE "subtotal" < 0
          OR "shipping" < 0
          OR "discount" < 0
          OR "total" < 0
      ) AS invalid_orders
  `);

  console.log(
    JSON.stringify(result.rows[0]),
  );
} finally {
  await client.end();
}
