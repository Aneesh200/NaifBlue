import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Starting data migration for school references...');
    
    // 1. Find all valid school IDs
    const allSchools = await prisma.school.findMany({
      select: { id: true },
    });
    
    const schoolIds = new Set(allSchools.map(s => s.id));
    
    // 2. Get all products with school_id that's not null
    const productsWithSchools = await prisma.product.findMany({
      where: {
        school_id: { not: null },
      },
      select: {
        id: true,
        school_id: true,
      },
    });
    
    // 3. Filter to find products with invalid school_id
    const productsWithInvalidSchools = productsWithSchools.filter(
      product => product.school_id && !schoolIds.has(product.school_id)
    );
    
    console.log(`Found ${productsWithInvalidSchools.length} products with invalid school references`);
    
    // 4. Update those products to set school_id to null
    if (productsWithInvalidSchools.length > 0) {
      const updatePromises = productsWithInvalidSchools.map(product =>
        prisma.product.update({
          where: { id: product.id },
          data: { school_id: null },
        })
      );
      
      await Promise.all(updatePromises);
      console.log('Fixed all invalid school references');
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