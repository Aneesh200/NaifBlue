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
        category: true,
        product_sizes: true,
      },
    }) as any[]; // Use any[] type to avoid TypeScript errors

    // Transform the products to include category_name and sizes
    const transformedProducts = products.map((product) => ({
      ...product,
      category_name: product.category?.name || null,
      school_name: product.school?.name || null,
      // Extract just the size names to an array
      sizes: product.product_sizes.map((sizeObj: any) => sizeObj.size),
      // Remove the full product_sizes object to keep the response clean
      product_sizes: undefined
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
} 