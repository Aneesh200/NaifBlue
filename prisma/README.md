# Database Schema Migration Guide

This guide will help you address foreign key constraint issues in the Prisma schema and properly migrate your database.

## Common Issues

If you encounter foreign key constraint errors like this:

```
Error: insert or update on table "products" violates foreign key constraint "products_category_id_fkey"
```

This means some products in your database reference categories or schools that don't exist.

## Fix Steps

1. **Run the data migration scripts**

   First, make sure your schema has the `onDelete: SetNull` option for foreign keys. Then run the following command to fix the inconsistent foreign key references:

   ```bash
   npm run fix:relations
   ```

   This will:
   - Find all products with invalid category_id references and set them to null
   - Find all products with invalid school_id references and set them to null

2. **Apply the schema changes**

   After fixing the data, apply the schema changes:

   ```bash
   npm run db:push
   ```

3. **Verify the changes**

   You can check the database with Prisma Studio:

   ```bash
   npm run db:studio
   ```

## Database Schema Improvements

The current schema has been optimized with:

1. **Consolidated User model**: Merged Profile and User models
2. **Improved relations**: All relations are properly defined with foreign keys
3. **Indexes and constraints**: Added indexes for better query performance
4. **Table mappings**: Consistent table naming with snake_case
5. **Proper cascade options**: Added `onDelete: SetNull` where appropriate

## Next Steps

After fixing the current issues, consider:

1. Using proper Prisma migrations instead of direct db pushes
2. Setting up validation for data consistency at the application level
3. Adding database-level constraints for additional data integrity 