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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        // Validate category name
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        const trimmedName = name.trim();

        // Check if category already exists (case-insensitive)
        const existingCategory = await prisma.category.findFirst({
            where: {
                name: {
                    equals: trimmedName,
                    mode: 'insensitive'
                }
            }
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: 'Category already exists', category: existingCategory },
                { status: 409 }
            );
        }

        // Create new category
        const newCategory = await prisma.category.create({
            data: {
                name: trimmedName,
            }
        });

        return NextResponse.json({
            category: newCategory,
            success: true,
            message: 'Category created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}