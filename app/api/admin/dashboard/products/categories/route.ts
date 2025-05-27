import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch all categories from the dedicated Category model
        const categoriesData = await prisma.category.findMany({
            select: {
                id: true,
                name: true,
                // Get count of products in each category
                _count: {
                    select: {
                        products: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Format the response
        const categories = categoriesData.map(category => ({
            id: category.id,
            name: category.name,
            productCount: category._count.products
        }));

        return NextResponse.json({
            categories,
            success: true
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}