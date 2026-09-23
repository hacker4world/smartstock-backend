-- =============================================================================
-- SmartStock — fake data for manual testing
--
-- Inserts 50 units, 50 depots (warehouses), 50 categories, 50 suppliers,
-- 50 manufacturers and 50 products (each linked to 1-2 suppliers).
--
-- IMPORTANT: `categories.subfamily_id` is NOT NULL and references `subfamilies`,
-- which itself references `families`. Those two tables are therefore populated
-- first (10 families x 5 subfamilies = 50 subfamilies) so that the 50 categories
-- always have a valid parent to attach to.
--
-- IMPORTANT: `products` references `units`, `warehouses` and `categories`, so its
-- insert (section 6) must run *after* sections 1-3.
--
-- Safe to re-run: each insert is guarded so it only fires when the target table
-- is empty. Timestamps are backdated randomly so the lists don't all look like
-- they were created in the same second.
-- =============================================================================

BEGIN;

-- ── 1. Units ─────────────────────────────────────────────────────────────────
-- `units.name` is UNIQUE, so the guard below avoids duplicate-key errors.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM units) THEN
    INSERT INTO units (name, "createdAt", "updatedAt")
    SELECT
      'Unité ' || lpad(gs::text, 2, '0'),
      now() - (random() * interval '90 days'),
      now() - (random() * interval '90 days')
    FROM generate_series(1, 50) AS gs;

    RAISE NOTICE 'Inserted 50 units.';
  ELSE
    RAISE NOTICE 'units already populated — skipped.';
  END IF;
END
$$;

-- ── 2. Depots (warehouses) ───────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM warehouses) THEN
    INSERT INTO warehouses (name, address, "createdAt", "updatedAt")
    SELECT
      'Dépôt ' || lpad(gs::text, 2, '0'),
      'Zone industrielle, Lot ' || lpad(gs::text, 3, '0') ||
        ', Rue ' || lpad((gs % 20)::text, 2, '0'),
      now() - (random() * interval '90 days'),
      now() - (random() * interval '90 days')
    FROM generate_series(1, 50) AS gs;

    RAISE NOTICE 'Inserted 50 depots.';
  ELSE
    RAISE NOTICE 'warehouses already populated — skipped.';
  END IF;
END
$$;

-- ── 3. Categories ────────────────────────────────────────────────────────────
-- Requires families -> subfamilies first (both are created here).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categories) THEN
    -- 3a. Families (10)
    IF NOT EXISTS (SELECT 1 FROM families) THEN
      INSERT INTO families (name, "createdAt", "updatedAt")
      SELECT
        'Famille ' || lpad(gs::text, 2, '0'),
        now() - (random() * interval '90 days'),
        now() - (random() * interval '90 days')
      FROM generate_series(1, 10) AS gs;

      RAISE NOTICE 'Inserted 10 families.';
    ELSE
      RAISE NOTICE 'families already populated — skipped.';
    END IF;

    -- 3b. Subfamilies (50 = 5 per family)
    IF NOT EXISTS (SELECT 1 FROM subfamilies) THEN
      INSERT INTO subfamilies (name, "familyId", "createdAt", "updatedAt")
      SELECT
        'Sous-famille ' || lpad(gs::text, 2, '0'),
        ((gs - 1) % 10) + 1,           -- cycles 1..10, matching the family ids above
        now() - (random() * interval '90 days'),
        now() - (random() * interval '90 days')
      FROM generate_series(1, 50) AS gs;

      RAISE NOTICE 'Inserted 50 subfamilies.';
    ELSE
      RAISE NOTICE 'subfamilies already populated — skipped.';
    END IF;

    -- 3c. Categories (50, spread across the 50 subfamilies)
    INSERT INTO categories (name, "subfamilyId", "createdAt", "updatedAt")
    SELECT
      'Catégorie ' || lpad(gs::text, 2, '0'),
      gs,                             -- 1..50, matching the subfamily ids above
      now() - (random() * interval '90 days'),
      now() - (random() * interval '90 days')
    FROM generate_series(1, 50) AS gs;

    RAISE NOTICE 'Inserted 50 categories.';
  ELSE
    RAISE NOTICE 'categories already populated — skipped.';
  END IF;
END
$$;

-- ── 4. Suppliers ─────────────────────────────────────────────────────────────
-- `suppliers.contact` is NOT NULL, so every row gets one.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM suppliers) THEN
    INSERT INTO suppliers (name, contact, "createdAt", "updatedAt")
    SELECT
      'Fournisseur ' || lpad(gs::text, 2, '0'),
      '+212 ' || lpad((600000000 + floor(random() * 39999999))::bigint::text, 9, '0'),
      now() - (random() * interval '90 days'),
      now() - (random() * interval '90 days')
    FROM generate_series(1, 50) AS gs;

    RAISE NOTICE 'Inserted 50 suppliers.';
  ELSE
    RAISE NOTICE 'suppliers already populated — skipped.';
  END IF;
END
$$;

-- ── 5. Manufacturers ─────────────────────────────────────────────────────────
-- `contact` and `address` are nullable, but filled here for a more realistic list.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM manufacturers) THEN
    INSERT INTO manufacturers (name, contact, address, "createdAt", "updatedAt")
    SELECT
      'Fabricant ' || lpad(gs::text, 2, '0'),
      '+212 ' || lpad((600000000 + floor(random() * 39999999))::bigint::text, 9, '0'),
      'Zone industrielle, Lot ' || lpad(gs::text, 3, '0') ||
        ', Ville ' || lpad(((gs - 1) % 10 + 1)::text, 2, '0'),
      now() - (random() * interval '90 days'),
      now() - (random() * interval '90 days')
    FROM generate_series(1, 50) AS gs;

    RAISE NOTICE 'Inserted 50 manufacturers.';
  ELSE
    RAISE NOTICE 'manufacturers already populated — skipped.';
  END IF;
END
$$;

-- ── 6. Products ──────────────────────────────────────────────────────────────
-- Requires sections 1-3 (units, warehouses, categories) to have run first.
-- The seeded products are linked to suppliers in section 7, which runs after the
-- COMMIT below so it can see the freshly inserted products and suppliers.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products) THEN
    INSERT INTO products (
      name, stock, "minimumStock", "averagePrice",
      "unitId", "warehouseId", "categoryId",
      "createdAt", "updatedAt"
    )
    SELECT
      'Produit ' || lpad(gs::text, 2, '0'),
      (random() * 500)::numeric(12, 2),
      (10 + (gs % 5) * 5)::numeric(12, 2),
      (5 + random() * 200)::numeric(12, 2),
      gs,                            -- 1..50 units
      ((gs - 1) % 50) + 1,           -- 1..50 warehouses
      ((gs * 7 - 1) % 50) + 1,       -- pseudo-random 1..50 categories
      now() - (random() * interval '90 days'),
      now() - (random() * interval '90 days')
    FROM generate_series(1, 50) AS gs;

    RAISE NOTICE 'Inserted 50 products.';
  ELSE
    RAISE NOTICE 'products already populated — skipped.';
  END IF;
END
$$;

COMMIT;

-- =============================================================================
-- 7. Product ↔ supplier links
-- =============================================================================
-- `products` and `suppliers` are both populated above, so this runs after the
-- COMMIT of section 6. Each product gets 1-2 suppliers (a second one for every
-- other product), giving ~75 links to exercise the many-to-many filter. Only the
-- first 50 products are linked so this stays a no-op on re-run.

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM product_suppliers) THEN
    INSERT INTO product_suppliers ("productId", "supplierId")
    SELECT p.id, ((p.id + gs - 2) % 50) + 1
    FROM products p
    CROSS JOIN generate_series(1, 2) AS gs
    WHERE p.id <= 50                                   -- only freshly seeded products
      AND (gs = 1 OR p.id % 2 = 0)                     -- every product, + second supplier on even ids
    ON CONFLICT ("productId", "supplierId") DO NOTHING;

    RAISE NOTICE 'Linked products to suppliers.';
  ELSE
    RAISE NOTICE 'product_suppliers already populated — skipped.';
  END IF;
END
$$;

COMMIT;

-- =============================================================================
-- Verification
-- =============================================================================

SELECT 'units' AS "table", count(*) AS rows FROM units
UNION ALL
SELECT 'families', count(*) FROM families
UNION ALL
SELECT 'subfamilies', count(*) FROM subfamilies
UNION ALL
SELECT 'categories', count(*) FROM categories
UNION ALL
SELECT 'warehouses (depots)', count(*) FROM warehouses
UNION ALL
SELECT 'suppliers', count(*) FROM suppliers
UNION ALL
SELECT 'manufacturers', count(*) FROM manufacturers
UNION ALL
SELECT 'products', count(*) FROM products
UNION ALL
SELECT 'product_suppliers', count(*) FROM product_suppliers
ORDER BY 1;
