-- Add is_active column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index on is_active
CREATE INDEX IF NOT EXISTS products_is_active_idx ON products(is_active);

-- Set all existing products to active
UPDATE products SET is_active = true WHERE is_active IS NULL;

