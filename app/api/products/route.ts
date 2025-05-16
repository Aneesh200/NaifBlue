import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const schoolId = url.searchParams.get('school');
    
    // Fetch all products with sizes and optional school filter
    const products = await prisma.product.findMany({
      where: {
        in_stock: true,
        ...(schoolId ? { school_id: schoolId } : {})
      },
      include: {
        school: true,
        category: {
          select: {
            id: true,
            name: true
          }
        },
        product_sizes: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Transform the products to include category_name and sizes
    const transformedProducts = products.map((product) => {
      console.log('Product category:', product.category); // Debug log
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        category_name: product.category?.name || 'Uncategorized',
        school_name: product.school?.name || null,
        school_id: product.school_id,
        sizes: product.product_sizes.map((sizeObj) => sizeObj.size),
        in_stock: product.in_stock,
        created_at: product.created_at
      };
    });

    console.log('Transformed products:', transformedProducts.map(p => ({ id: p.id, category: p.category_name }))); // Debug log

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
} 