import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProductSizes() {
  try {
    console.log('Seeding product sizes...');
    
    // Get all products
    const products = await prisma.product.findMany();
    
    // Sizes data
    const standardSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const kidSizes = ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'];
    const footwearSizes = ['UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
    const accessorySizes = ['One Size'];
    
    // Map categories to size types (adjust based on your actual categories)
    const sizeMapping: Record<string, string[]> = {
      'Uniform': standardSizes,
      'Shoes': footwearSizes,
      'Accessories': accessorySizes,
      'Sports': standardSizes,
      'Kids': kidSizes,
    };
    
    // Age range mappings (for kids sizes)
    const ageRanges: Record<string, string> = {
      '2-3Y': '2-3 years',
      '4-5Y': '4-5 years',
      '6-7Y': '6-7 years',
      '8-9Y': '8-9 years',
      '10-11Y': '10-11 years',
      '12-13Y': '12-13 years',
    };
    
    // Create sizes for each product
    for (const product of products) {
      console.log(`Adding sizes for product: ${product.name}`);
      
      // Check if product already has sizes
      const existingSizes = await prisma.productSize.findMany({
        where: { product_id: product.id },
      });
      
      if (existingSizes.length > 0) {
        console.log(`Product ${product.name} already has sizes, skipping...`);
        continue;
      }
      
      // Get product category
      const productWithCategory = await prisma.product.findUnique({
        where: { id: product.id },
        include: { category: true },
      });
      
      // Determine which sizes to use based on category
      let sizesToUse = standardSizes;
      
      if (productWithCategory?.category) {
        const categoryName = productWithCategory.category.name;
        // Find matching category or use standard sizes as fallback
        for (const [key, value] of Object.entries(sizeMapping)) {
          if (categoryName.includes(key)) {
            sizesToUse = value;
            break;
          }
        }
      }
      
      // Create sizes for this product
      for (const size of sizesToUse) {
        await prisma.productSize.create({
          data: {
            product_id: product.id,
            size: size,
            age_range: ageRanges[size] || null,
            stock: Math.floor(Math.random() * 50) + 5, // Random stock between 5 and 54
          },
        });
      }
      
      console.log(`Added ${sizesToUse.length} sizes for product: ${product.name}`);
    }
    
    console.log('Product sizes seeded successfully!');
  } catch (error) {
    console.error('Error seeding product sizes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedProductSizes()
  .then(() => console.log('Done seeding product sizes'))
  .catch((e) => console.error(e)); 