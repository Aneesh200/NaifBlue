import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { ShippingAddress } from '@/lib/types';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        // Get status from query params if provided, otherwise default to 'placed' or 'successful'
        const { searchParams } = new URL(request.url);
        const statusParam = searchParams.get('status');
        
        // If no status specified, fetch both placed and successful orders
        const statusFilter = statusParam ? { status: statusParam } : {
            status: { in: ['placed', 'successful'] }
        };

        // Fetch orders with the specified status
        const dbOrders = await prisma.order.findMany({
            where: statusFilter,
            include: {
                user: {
                    select: {
                        name: true
                    }
                },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        // Transform the database orders to match the frontend interface
        const orders = dbOrders.map(order => {
            // Improved shipping address handling
            let shippingAddress = "N/A";
            if (order.shipping_address && typeof order.shipping_address === "object") {
                // Cast to ShippingAddress type to fix type error
                const addr = order.shipping_address as unknown as ShippingAddress;

                shippingAddress = [
                    addr.name,
                    addr.address_line1,
                    addr.address_line2,
                    addr.city,
                    addr.state,
                    addr.country,
                    addr.postal_code,
                    addr.phone,
                    addr.email
                ].filter(Boolean).join(", ");
            } else if (typeof order.shipping_address === "string") {
                shippingAddress = order.shipping_address;
            }

            return {
                id: order.id,
                customerName: order.user.name || 'Unknown Customer',
                orderDate: order.created_at.toISOString(),
                items: order.items.map(item => ({
                    name: item.product.name,
                    quantity: item.quantity
                })),
                status: order.status as "placed" | "successful" | "fulfilled",
                address: shippingAddress
            };
        });

        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}