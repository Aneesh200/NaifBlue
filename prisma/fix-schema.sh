#!/bin/bash

# Make sure the script exits on first error
set -e

echo "=== Database Schema Repair Tool ==="
echo "This script will fix foreign key constraint issues and apply the schema changes."
echo ""

# Step 1: Run data migrations to fix the inconsistent foreign keys
echo "Step 1: Fixing category relationships..."
npm run fix:categories

echo "Step 2: Fixing school relationships..."
npm run fix:schools

# Step 3: Apply the schema changes
echo "Step 3: Applying schema changes..."
npm run db:push

echo "Step 4: Verification - Opening Prisma Studio..."
echo "Please check your database structure and verify the data integrity."
npm run db:studio

echo ""
echo "Schema repair completed successfully!"
echo "If you encounter any issues, please refer to the prisma/README.md file." 