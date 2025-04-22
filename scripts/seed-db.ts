import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Sample product data
const products = [
  {
    name: 'Boys School Uniform Set - Navy',
    description: 'Complete school uniform set for boys including a navy blue blazer, white shirt, and grey trousers. Made from durable and comfortable fabric perfect for everyday wear.',
    price: 1499.99,
    images: [
      'https://images.unsplash.com/photo-1621452773781-0453c1b5e1cf',
      'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7'
    ],
    category_name: 'Boys Uniform',
    sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y'],
    in_stock: true
  },
  {
    name: 'Girls School Uniform Set - Navy',
    description: 'Complete school uniform set for girls including a navy blue blazer, white blouse, and pleated skirt. Made from high quality, easy-care fabrics that are both comfortable and durable.',
    price: 1599.99,
    images: [
      'https://images.unsplash.com/photo-1604671801908-6f0c6a092c05',
      'https://images.unsplash.com/photo-1604671801890-fd5bcd9a88e5'
    ],
    category_name: 'Girls Uniform',
    sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y'],
    in_stock: true
  },
  {
    name: 'School Blazer - Navy Blue',
    description: 'High quality navy blue school blazer with pocket emblem. Made from polyester blend for comfort and durability. Perfect for all seasons.',
    price: 899.99,
    images: [
      'https://images.unsplash.com/photo-1598554747436-c9293d6a588f',
    ],
    category_name: 'Blazers',
    sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y', '13-14Y'],
    in_stock: true
  },
  {
    name: 'School Shirt - White (Pack of 2)',
    description: 'Pack of 2 crisp white school shirts with short sleeves. Easy-care fabric with soil release technology that helps remove stains during washing.',
    price: 499.99,
    images: [
      'https://images.unsplash.com/photo-1603252109303-2751441dd157',
    ],
    category_name: 'Shirts',
    sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y', '13-14Y'],
    in_stock: true
  },
  {
    name: 'School Trousers - Grey',
    description: 'Classic grey school trousers with adjustable waist for growing children. Made from hardwearing fabric with stain resistance treatment.',
    price: 399.99,
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a',
    ],
    category_name: 'Trousers',
    sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y', '13-14Y'],
    in_stock: true
  },
  {
    name: 'School Skirt - Pleated Navy',
    description: 'Navy blue pleated skirt for school uniform. Features an elasticated waistband for comfort and ease of wearing.',
    price: 349.99,
    images: [
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03',
    ],
    category_name: 'Skirts',
    sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y', '13-14Y'],
    in_stock: true
  },
  {
    name: 'School Sweater - Navy V-Neck',
    description: 'Soft, comfortable V-neck sweater in navy blue. Perfect for layering in cooler weather. Machine washable and colorfast.',
    price: 449.99,
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633',
    ],
    category_name: 'Sweaters',
    sizes: ['3-4Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y', '13-14Y'],
    in_stock: true
  },
  {
    name: 'School Shoes - Black Leather',
    description: 'Durable black leather school shoes with slip-resistant soles. Designed for comfort and long wear with padded ankles and reinforced toes.',
    price: 799.99,
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2',
    ],
    category_name: 'Shoes',
    sizes: ['UK1', 'UK2', 'UK3', 'UK4', 'UK5', 'UK6'],
    in_stock: true
  },
  {
    name: 'School Tie - Navy and Red Stripe',
    description: 'Official school tie in navy blue with red stripe pattern. Easy to clip on for younger children.',
    price: 199.99,
    images: [
      'https://images.unsplash.com/photo-1589756823695-278bc923f962',
    ],
    category_name: 'Accessories',
    sizes: ['One Size'],
    in_stock: true
  },
  {
    name: 'School Backpack - Navy',
    description: 'Spacious, ergonomic school backpack with multiple compartments. Water-resistant material and padded straps for comfort.',
    price: 599.99,
    images: [
      'https://images.unsplash.com/photo-1588072432836-e10032774350',
    ],
    category_name: 'Accessories',
    sizes: ['One Size'],
    in_stock: true
  }
];

// Sample schools data
const schools = [
  {
    name: 'Delhi Public School',
    address: 'Ring Road, New Delhi, 110024',
    contact_number: '+91 11 2745 9556',
    uniform_requirements: 'Navy blazer, white shirt, grey trousers/skirt, navy and red striped tie',
    logo_url: 'https://placehold.co/400x200/png?text=DPS',
  },
  {
    name: 'St. Xavier\'s School',
    address: 'Park Street, Kolkata, 700016',
    contact_number: '+91 33 2229 7429',
    uniform_requirements: 'Navy blazer, white shirt, navy trousers/skirt, school tie with blue and white stripes',
    logo_url: 'https://placehold.co/400x200/png?text=St+Xavier',
  },
  {
    name: 'Modern High School',
    address: 'J.B.S Haldane Avenue, Mumbai, 400018',
    contact_number: '+91 22 2493 8234',
    uniform_requirements: 'White shirt, navy blue shorts/trousers/skirt, school tie, black shoes',
    logo_url: 'https://placehold.co/400x200/png?text=Modern+High',
  },
  {
    name: 'Army Public School',
    address: 'Delhi Cantonment, New Delhi, 110010',
    contact_number: '+91 11 2569 4145',
    uniform_requirements: 'Khaki uniform with school badge, white shirt for special occasions',
    logo_url: 'https://placehold.co/400x200/png?text=APS',
  },
  {
    name: 'Kendriya Vidyalaya',
    address: 'Sector 12, Dwarka, New Delhi, 110078',
    contact_number: '+91 11 2389 5478',
    uniform_requirements: 'Light blue shirt, navy blue trousers/skirt, navy blue tie with striped pattern',
    logo_url: 'https://placehold.co/400x200/png?text=KV',
  }
];

// Sample categories
const categories = [
  { name: 'Boys Uniform' },
  { name: 'Girls Uniform' },
  { name: 'Blazers' },
  { name: 'Shirts' },
  { name: 'Trousers' },
  { name: 'Skirts' },
  { name: 'Sweaters' },
  { name: 'Shoes' },
  { name: 'Accessories' }
];

// Function to add test products to the database
async function seedProducts() {
  console.log('Seeding products...');
  
  // Get all categories
  const categoryData = await prisma.category.findMany();
  const categoryMap = categoryData.reduce((map, category) => {
    map[category.name] = category.id;
    return map;
  }, {} as Record<string, string>);
  
  // Get first school
  const firstSchool = await prisma.school.findFirst();
  const schoolId = firstSchool?.id;
  
  // Clear existing products (optional)
  await prisma.product.deleteMany();
  
  // Insert new products
  for (const product of products) {
    const categoryId = categoryMap[product.category_name];
    
    const createdProduct = await prisma.product.create({
      data: {
        ...product,
        ...(categoryId ? { category_id: categoryId } : {}),
        ...(schoolId ? { school_id: schoolId } : {})
      }
    });
    
    console.log(`Added product: ${product.name}`);
    
    // Create product sizes for each size
    if (product.sizes && product.sizes.length > 0) {
      for (const size of product.sizes) {
        await prisma.productSize.create({
          data: {
            product_id: createdProduct.id,
            size,
            stock: Math.floor(Math.random() * 20) + 5 // Random stock between 5-25
          }
        });
      }
    }
  }

  console.log('Product seeding completed!');
}

// Function to add test schools to the database
async function seedSchools() {
  console.log('Seeding schools...');
  
  // Clear existing schools (optional)
  await prisma.school.deleteMany();
  
  // Insert new schools
  for (const school of schools) {
    const createdSchool = await prisma.school.create({
      data: school
    });
    
    console.log(`Added school: ${school.name}`);
  }

  console.log('School seeding completed!');
}

// Function to add test categories to the database
async function seedCategories() {
  console.log('Seeding categories...');
  
  // Clear existing categories (optional)
  await prisma.category.deleteMany();
  
  // Insert new categories
  for (const category of categories) {
    const createdCategory = await prisma.category.create({
      data: category
    });
    
    console.log(`Added category: ${category.name}`);
  }

  console.log('Category seeding completed!');
}

// Run the seeding functions
async function seedDatabase() {
  try {
    await seedSchools();
    await seedCategories();
    await seedProducts();
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase(); 