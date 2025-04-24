import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;

    // Fetch the product with sizes
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        school: true,
        category: true,
        product_sizes: true,
      },
    }) as any; // Use any type to avoid TypeScript errors

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Transform the product to include category_name and sizes
    const transformedProduct = {
      ...product,
      category_name: product.category?.name || null,
      // Extract just the size names to an array
      sizes: product.product_sizes.map((sizeObj: any) => sizeObj.size),
      // Remove the full product_sizes object to keep the response clean
      product_sizes: undefined
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
} 