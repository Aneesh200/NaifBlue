import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        // Parse query parameters
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status') || undefined;
        const search = searchParams.get('search') || undefined;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Build the where clause for filtering with proper typing
        const whereClause: Prisma.OrderWhereInput = {};
        if (status) {
            whereClause.status = status;
        }

        // Add search functionality
        if (search) {
            whereClause.OR = [
                {
                    id: {
                        contains: search,
                        mode: 'insensitive'
                    }
                },
                {
                    user: {
                        name: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                },
                {
                    user: {
                        email: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    }
                }
            ];
        }

        // Fetch orders with pagination
        const [orders, totalOrders, recentOrders] = await Promise.all([
            // Paginated orders
            prisma.order.findMany({
                skip,
                take: limit,
                where: whereClause,
                orderBy: {
                    created_at: 'desc'
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    images: true
                                }
                            },
                            product_size: {
                                select: {
                                    size: true
                                }
                            }
                        }
                    },
                    status_logs: {
                        orderBy: {
                            created_at: 'desc'
                        },
                        take: 1
                    }
                }
            }),

            // Total count for pagination
            prisma.order.count({
                where: whereClause
            }),

            // Recent orders (top 3)
            prisma.order.findMany({
                take: 3,
                where: whereClause,
                orderBy: {
                    created_at: 'desc'
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    images: true
                                }
                            },
                            product_size: true
                        }
                    }
                }
            })
        ]);

        // Format the order data for better readability
        const formattedOrders = orders.map(order => ({
            id: order.id,
            orderNumber: `#NB-${order.id.substring(0, 8)}`,
            customerName: order.user.name || 'Guest',
            customerEmail: order.user.email,
            status: order.status,
            totalAmount: `₹${order.total_amount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            rawAmount: order.total_amount,
            items: order.items.map(item => ({
                id: item.id,
                productName: item.product.name,
                quantity: item.quantity,
                price: item.price,
                size: item.product_size.size,
                image: item.product.images[0] || null
            })),
            itemCount: order.items.length,
            createdAt: order.created_at,
            lastUpdated: order.updated_at,
            shippingAddress: order.shipping_address
        }));

        // Format recent orders similarly
        const formattedRecentOrders = recentOrders.map(order => ({
            id: order.id,
            orderNumber: `#NB-${order.id.substring(0, 8)}`,
            customerName: order.user.name || 'Guest',
            customerEmail: order.user.email,
            status: order.status,
            totalAmount: `₹${order.total_amount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            rawAmount: order.total_amount,
            itemCount: order.items.length,
            createdAt: order.created_at
        }));

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalOrders / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return NextResponse.json({
            orders: formattedOrders,
            recentOrders: formattedRecentOrders,
            pagination: {
                page,
                limit,
                totalOrders,
                totalPages,
                hasNextPage,
                hasPrevPage
            }
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}