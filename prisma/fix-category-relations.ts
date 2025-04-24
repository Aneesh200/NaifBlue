import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Starting data migration for category references...');
    
    // 1. Find products with invalid category_id (references that don't exist)
    const allCategories = await prisma.category.findMany({
      select: { id: true },
    });
    
    const categoryIds = new Set(allCategories.map(c => c.id));
    
    // 2. Get all products with category_id that's not null
    const productsWithCategories = await prisma.product.findMany({
      where: {
        category_id: { not: null },
      },
      select: {
        id: true,
        category_id: true,
      },
    });
    
    // 3. Filter to find products with invalid category_id
    const productsWithInvalidCategories = productsWithCategories.filter(
      product => product.category_id && !categoryIds.has(product.category_id)
    );
    
    console.log(`Found ${productsWithInvalidCategories.length} products with invalid category references`);
    
    // 4. Update those products to set category_id to null
    if (productsWithInvalidCategories.length > 0) {
      const updatePromises = productsWithInvalidCategories.map(product =>
        prisma.product.update({
          where: { id: product.id },
          data: { category_id: null },
        })
      );
      
      await Promise.all(updatePromises);
      console.log('Fixed all invalid category references');
    }
    
    console.log('Data migration completed successfully');
  } catch (error) {
    console.error('Error during data migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error('Migration script failed:', e);
  process.exit(1);
}); 