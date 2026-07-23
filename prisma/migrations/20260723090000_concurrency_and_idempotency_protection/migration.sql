-- Add nullable columns first so existing rows can be migrated safely.
ALTER TABLE "CartItem"
ADD COLUMN "variantKey" TEXT;

ALTER TABLE "Order"
ADD COLUMN "idempotencyKey" TEXT;

-- Backfill the same length-prefixed variant identity used by application code.
UPDATE "CartItem"
SET "variantKey" =
  CASE
    WHEN "selectedColor" IS NULL THEN 'n'
    ELSE 's' || octet_length("selectedColor")::TEXT || ':' || "selectedColor"
  END
  || '|' ||
  CASE
    WHEN "selectedSize" IS NULL THEN 'n'
    ELSE 's' || octet_length("selectedSize")::TEXT || ':' || "selectedSize"
  END;

-- Merge legacy duplicate exact variants without losing their quantities.
WITH duplicate_groups AS (
  SELECT
    "cartId",
    "productId",
    "variantKey",
    MIN("id") AS "keeperId",
    SUM("quantity")::INTEGER AS "mergedQuantity",
    MAX("updatedAt") AS "latestUpdatedAt"
  FROM "CartItem"
  GROUP BY
    "cartId",
    "productId",
    "variantKey"
  HAVING COUNT(*) > 1
)
UPDATE "CartItem" AS keeper
SET
  "quantity" = duplicate_groups."mergedQuantity",
  "updatedAt" = duplicate_groups."latestUpdatedAt"
FROM duplicate_groups
WHERE keeper."id" = duplicate_groups."keeperId";

WITH duplicate_groups AS (
  SELECT
    "cartId",
    "productId",
    "variantKey",
    MIN("id") AS "keeperId"
  FROM "CartItem"
  GROUP BY
    "cartId",
    "productId",
    "variantKey"
  HAVING COUNT(*) > 1
)
DELETE FROM "CartItem" AS duplicate
USING duplicate_groups
WHERE duplicate."cartId" = duplicate_groups."cartId"
  AND duplicate."productId" = duplicate_groups."productId"
  AND duplicate."variantKey" = duplicate_groups."variantKey"
  AND duplicate."id" <> duplicate_groups."keeperId";

ALTER TABLE "CartItem"
ALTER COLUMN "variantKey" SET NOT NULL;

CREATE UNIQUE INDEX "CartItem_cartId_productId_variantKey_key"
ON "CartItem"("cartId", "productId", "variantKey");

CREATE UNIQUE INDEX "Order_userId_idempotencyKey_key"
ON "Order"("userId", "idempotencyKey");

-- Enforce critical numeric business invariants in PostgreSQL.
ALTER TABLE "Inventory"
ADD CONSTRAINT "Inventory_quantity_nonnegative"
CHECK ("quantity" >= 0),
ADD CONSTRAINT "Inventory_reservedQuantity_nonnegative"
CHECK ("reservedQuantity" >= 0),
ADD CONSTRAINT "Inventory_reservedQuantity_lte_quantity"
CHECK ("reservedQuantity" <= "quantity");

ALTER TABLE "CartItem"
ADD CONSTRAINT "CartItem_quantity_positive"
CHECK ("quantity" > 0);

ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_quantity_positive"
CHECK ("quantity" > 0),
ADD CONSTRAINT "OrderItem_unitPrice_nonnegative"
CHECK ("unitPrice" >= 0),
ADD CONSTRAINT "OrderItem_totalPrice_nonnegative"
CHECK ("totalPrice" >= 0);

ALTER TABLE "Order"
ADD CONSTRAINT "Order_subtotal_nonnegative"
CHECK ("subtotal" >= 0),
ADD CONSTRAINT "Order_shipping_nonnegative"
CHECK ("shipping" >= 0),
ADD CONSTRAINT "Order_discount_nonnegative"
CHECK ("discount" >= 0),
ADD CONSTRAINT "Order_total_nonnegative"
CHECK ("total" >= 0);

-- Support stable ordering used by activity cursors and order lists.
CREATE INDEX "ActivityLog_createdAt_id_idx"
ON "ActivityLog"("createdAt", "id");

CREATE INDEX "Order_createdAt_id_idx"
ON "Order"("createdAt", "id");
