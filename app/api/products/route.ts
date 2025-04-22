import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all products
    const products = await prisma.product.findMany({
      where: {
        in_stock: true,
      },
      include: {
        school: true,
        category: true,
      },
    });

    // Transform the products to include category_name
    const transformedProducts = products.map((product) => ({
      ...product,
      category_name: product.category?.name || product.category_name,
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
} 