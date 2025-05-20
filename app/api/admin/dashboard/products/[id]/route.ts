import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET endpoint - get product details
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const productId = params.id;

        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                product_sizes: true,
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                school: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        if (!product) {
            return NextResponse.json(
                { message: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            product,
            success: true
        });

    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { message: 'Failed to fetch product', error },
            { status: 500 }
        );
    }
}

// PUT endpoint - update product
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const productId = params.id;
        const data = await request.json();

        // Extract fields for separate handling
        const { productSizes, removedImages, ...productData } = data;

        // Validate required fields
        if (!productData.name || !productData.price) {
            return NextResponse.json(
                { message: 'Name and price are required' },
                { status: 400 }
            );
        }

        // Update the product
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                name: productData.name,
                description: productData.description,
                price: productData.price,
                images: productData.images || [],
                in_stock: productData.in_stock,
                inventory_count: productData.inventory_count,
                category_id: productData.category_id || null,
                school_id: productData.school_id || null,
            }
        });

        // Handle product sizes
        if (productSizes && productSizes.length > 0) {
            // Get existing sizes to determine which to update or delete
            const existingSizes = await prisma.productSize.findMany({
                where: { product_id: productId }
            });

            const existingSizeIds = existingSizes.map(size => size.id);
            const updatedSizeIds = productSizes
                .filter(size => size.id)
                .map(size => size.id as string);

            // Sizes to delete (exist in DB but not in updated list)
            const sizesToDelete = existingSizeIds.filter(id => !updatedSizeIds.includes(id));

            // Delete removed sizes
            if (sizesToDelete.length > 0) {
                await prisma.productSize.deleteMany({
                    where: {
                        id: { in: sizesToDelete }
                    }
                });
            }

            // Update or create sizes
            for (const size of productSizes) {
                if (size.id) {
                    // Update existing size
                    await prisma.productSize.update({
                        where: { id: size.id },
                        data: {
                            size: size.size,
                            age_range: size.age_range,
                            stock: size.stock
                        }
                    });
                } else {
                    // Create new size
                    await prisma.productSize.create({
                        data: {
                            product_id: productId,
                            size: size.size,
                            age_range: size.age_range || null,
                            stock: size.stock
                        }
                    });
                }
            }
        }

        return NextResponse.json({
            message: 'Product updated successfully',
            product: updatedProduct,
            success: true
        });

    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { message: 'Failed to update product', error },
            { status: 500 }
        );
    }
}

// DELETE endpoint - delete product
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const productId = params.id;

        // First delete related product sizes
        await prisma.productSize.deleteMany({
            where: { product_id: productId }
        });

        // Then delete the product
        await prisma.product.delete({
            where: { id: productId }
        });

        return NextResponse.json({
            message: 'Product deleted successfully',
            success: true
        });

    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { message: 'Failed to delete product', error },
            { status: 500 }
        );
    }
}