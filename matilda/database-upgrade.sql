-- Matilda E-Commerce: Ultimate Database Upgrade Script
-- You can copy and run this script in your Supabase SQL Editor

-- 1. Ensure all tables have accurate timestamps
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
UPDATE products SET created_at = NOW() WHERE created_at IS NULL;
UPDATE products SET updated_at = NOW() WHERE updated_at IS NULL;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
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
