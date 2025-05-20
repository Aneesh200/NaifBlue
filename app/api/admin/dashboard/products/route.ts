import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '4');

        // Fetch the most recently created products
        const productsData = await prisma.product.findMany({
            take: limit,
            orderBy: {
                created_at: 'desc'  // Most recent first
            },
            select: {
                id: true,
                name: true,
                price: true,
                description: true,
                images: true, // This will be transformed to image_url
                category: true,
                created_at: true
            }
        });

        // Transform the data to match the expected frontend structure
        const products = productsData.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            description: product.description,
            // Handle different possible image field structures
            images: product.images,
            category: product.category,
            created_at: product.created_at.toISOString()
        }));

        return NextResponse.json({
            products,
            success: true
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Extract product sizes to create separately
        const { productSizes, ...productData } = data;

        // Validate required fields
        if (!productData.name || !productData.price) {
            return NextResponse.json(
                { message: 'Name and price are required' },
                { status: 400 }
            );
        }

        // Create the product
        const product = await prisma.product.create({
            data: {
                name: productData.name,
                description: productData.description,
                price: productData.price,
                images: productData.images || [],
                in_stock: productData.in_stock,
                inventory_count: productData.inventory_count,
                category_id: productData.category_id || null,
                school_id: productData.school_id || null,
            },
        });

        // Create product sizes if provided
        if (productSizes && productSizes.length > 0) {
            await Promise.all(
                productSizes.map((size: any) =>
                    prisma.productSize.create({
                        data: {
                            product_id: product.id,
                            size: size.size,
                            age_range: size.age_range || null,
                            stock: size.stock || 0,
                        },
                    })
                )
            );
        }

        return NextResponse.json({
            message: 'Product created successfully',
            id: product.id,
            success: true
        });

    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { message: 'Failed to create product', error },
            { status: 500 }
        );
    }
}