-- Matilda E-Commerce: Ultimate Database Upgrade Script
-- You can copy and run this script in your Supabase SQL Editor

-- 1. Ensure all tables have accurate timestamps
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
UPDATE products SET created_at = NOW() WHERE created_at IS NULL;
UPDATE products SET updated_at = NOW() WHERE updated_at IS NULL;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier_name VARCHAR(100) DEFAULT 'Delhivery Express';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE customers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 2. Discounts Table (If you want to use the discounts section fully)
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
  value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Advanced CRM Analytics Views
CREATE OR REPLACE VIEW admin_analytics_view AS
SELECT 
  DATE_TRUNC('day', created_at) as sale_date,
  COUNT(id) as total_orders,
  SUM(total_amount) as daily_revenue
FROM orders
WHERE status IN ('paid', 'shipped')
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY sale_date DESC;

-- 4. Enable Realtime Sync for Admin Tables (Optional but recommended)
-- alter publication supabase_realtime add table products;
-- alter publication supabase_realtime add table orders;
-- alter publication supabase_realtime add table customers;

-- 5. Add stock_count to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 0;

-- 6. Enforce Maximum Order Amount Limit (₹2,000 per order)
-- Ensures database-level integrity so that no single order can exceed 2000
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_max_order_amount'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT check_max_order_amount CHECK (total_amount <= 2000);
  END IF;
END $$;

-- 7. High-Performance Query & Analytics Indexes (Resilient with CamelCase and SnakeCase support)
DO $$
BEGIN
  -- Indexes on orders
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'created_at') THEN
      CREATE INDEX IF NOT EXISTS idx_orders_status_created_at ON orders(status, created_at DESC);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'phone') THEN
      CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'order_number') THEN
      CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
    END IF;
  END IF;

  -- Indexes on products
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'collection') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category') THEN
      CREATE INDEX IF NOT EXISTS idx_products_collection_category ON products(collection, category);
    END IF;
    
    -- Support both "isFeatured" (quoted camelCase) and is_featured
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'isFeatured') THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products("isFeatured") WHERE "isFeatured" = true';
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'is_featured') THEN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = true';
    END IF;
  END IF;

  -- Index on customers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'phone') THEN
      CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
    END IF;
  END IF;

  -- Index on store_settings
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_settings') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'key') THEN
      CREATE INDEX IF NOT EXISTS idx_store_settings_key ON store_settings(key);
    END IF;
  END IF;
END $$;

-- 8. Categories Table & Row-Level Security
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public categories access" ON categories;
CREATE POLICY "Public categories access" ON categories FOR ALL USING (true) WITH CHECK (true);

