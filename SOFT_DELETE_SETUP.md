# Product Soft Delete (Delist) Feature

## Overview
Products with existing orders can no longer be permanently deleted. Instead, they are "delisted" (soft deleted) by setting `is_active = false`. This preserves order history while hiding the product from the storefront.

## Database Setup

### Step 1: Run the SQL Migration
Execute the following SQL in your Supabase SQL Editor:

```sql
-- Add is_active column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index on is_active for better query performance
CREATE INDEX IF NOT EXISTS products_is_active_idx ON products(is_active);

-- Set all existing products to active
UPDATE products SET is_active = true WHERE is_active IS NULL;
```

### Step 2: Generate Prisma Client
After running the SQL, generate the Prisma client:

```bash
npx prisma generate
```

## How It Works

### Product Deletion Logic

1. **Products WITHOUT Orders**: Permanently deleted from database
2. **Products WITH Orders**: Soft deleted (is_active = false, in_stock = false)

### Frontend Behavior

- **Public Store**: Only shows products where `is_active = true`
- **Admin Dashboard**: Shows ALL products (both active and inactive)
- **Delisted Products**: Marked with indicator in admin view

### Success Messages

- **Soft Delete**: "Product delisted! It will no longer appear in the store but order history is preserved."
- **Hard Delete**: "Product permanently deleted"

## Benefits

✅ **Maintains Order Integrity**: Orders reference products that always exist
✅ **Preserves History**: Customer order history remains intact
✅ **Clean Storefront**: Delisted products don't appear to customers
✅ **Admin Visibility**: Admins can see and restore delisted products if needed

## Future Enhancements

- Add "Restore Product" button to reactivate delisted products
- Add filter in admin to show only active or inactive products
- Add visual indicator (badge) for delisted products in admin list

