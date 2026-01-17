import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables!');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function clearDatabase() {
  console.log('🗑️  Clearing all data from database...\n');

  try {
    // Delete in order respecting foreign key constraints
    console.log('Deleting order status logs...');
    await prisma.orderStatusLog.deleteMany({});
    
    console.log('Deleting order items...');
    await prisma.orderItem.deleteMany({});
    
    console.log('Deleting orders...');
    await prisma.order.deleteMany({});
    
    console.log('Deleting cart items...');
    await prisma.cartItem.deleteMany({});
    
    console.log('Deleting wishlist items...');
    await prisma.wishlistItem.deleteMany({});
    
    console.log('Deleting wishlists...');
    await prisma.wishlist.deleteMany({});
    
    console.log('Deleting product sizes...');
    await prisma.productSize.deleteMany({});
    
    console.log('Deleting products...');
    await prisma.product.deleteMany({});
    
    console.log('Deleting categories...');
    await prisma.category.deleteMany({});
    
    console.log('Deleting schools...');
    await prisma.school.deleteMany({});
    
    console.log('Deleting testimonials...');
    await prisma.testimonial.deleteMany({});
    
    console.log('Deleting portfolio items...');
    await prisma.portfolioItem.deleteMany({});
    
    console.log('Deleting coupons...');
    await prisma.coupon.deleteMany({});
    
    console.log('Deleting addresses...');
    await prisma.address.deleteMany({});
    
    console.log('Deleting users from database...');
    await prisma.user.deleteMany({});
    
    console.log('✅ Database cleared successfully!\n');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
}

async function deleteSupabaseAuthUsers() {
  console.log('🗑️  Deleting all Supabase Auth users...\n');
  
  try {
    // List all users
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }

    if (users && users.length > 0) {
      console.log(`Found ${users.length} users to delete...`);
      
      for (const user of users) {
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        if (deleteError) {
          console.error(`Error deleting user ${user.email}:`, deleteError);
        } else {
          console.log(`Deleted auth user: ${user.email}`);
        }
      }
      
      // Wait a moment for deletions to propagate
      console.log('Waiting for deletions to propagate...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      console.log('No auth users found to delete.');
    }
    
    console.log('✅ Supabase Auth users cleared!\n');
  } catch (error) {
    console.error('Error deleting Supabase Auth users:', error);
  }
}

async function seedUsers() {
  console.log('🌱 Seeding admin and warehouse users...\n');

  try {
    // 1. Create Admin User in Supabase Auth
    console.log('Creating admin user in Supabase Auth...');
    const { data: adminAuthData, error: adminAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@naifbleu.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin User',
        role: 'admin'
      },
      app_metadata: {
        role: 'admin'
      }
    });

    if (adminAuthError) {
      console.error('Error creating admin auth user:', adminAuthError);
      throw adminAuthError;
    }

    console.log('✅ Admin auth user created:', adminAuthData.user.email);

    // 2. Create Admin User in Database
    console.log('Creating admin user in database...');
    const adminUser = await prisma.user.create({
      data: {
        id: adminAuthData.user.id,
        email: 'admin@naifbleu.com',
        name: 'Admin User',
        role: 'admin',
      }
    });
    console.log('✅ Admin database user created:', adminUser.email);

    // 3. Create Warehouse User in Supabase Auth
    console.log('\nCreating warehouse user in Supabase Auth...');
    const { data: warehouseAuthData, error: warehouseAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: 'warehouse@naifbleu.com',
      password: 'warehouse123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Warehouse User',
        role: 'warehouse'
      },
      app_metadata: {
        role: 'warehouse'
      }
    });

    if (warehouseAuthError) {
      console.error('Error creating warehouse auth user:', warehouseAuthError);
      throw warehouseAuthError;
    }

    console.log('✅ Warehouse auth user created:', warehouseAuthData.user.email);

    // 4. Create Warehouse User in Database
    console.log('Creating warehouse user in database...');
    const warehouseUser = await prisma.user.create({
      data: {
        id: warehouseAuthData.user.id,
        email: 'warehouse@naifbleu.com',
        name: 'Warehouse User',
        role: 'warehouse',
      }
    });
    console.log('✅ Warehouse database user created:', warehouseUser.email);

    console.log('\n✨ Users seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n👨‍💼 ADMIN USER:');
    console.log('   Email:    admin@naifbleu.com');
    console.log('   Password: admin123');
    console.log('\n📦 WAREHOUSE USER:');
    console.log('   Email:    warehouse@naifbleu.com');
    console.log('   Password: warehouse123');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function main() {
  console.log('\n🚀 Starting database reset and user seeding...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Step 1: Delete Supabase Auth users FIRST (before database)
    await deleteSupabaseAuthUsers();

    // Step 2: Clear database
    await clearDatabase();

    // Step 3: Seed new users
    await seedUsers();

    console.log('✅ Database reset and seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during reset and seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

