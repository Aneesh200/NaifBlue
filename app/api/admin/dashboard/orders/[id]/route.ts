import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ShippingAddress } from '@/lib/types'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params
        // Fetch the order with related user and items
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                items: {
                    include: {
                        product: {
                            select: { name: true, images: true }
                        },
                        product_size: {
                            select: { size: true }
                        }
                    }
                }
            }
        })

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Format shipping address if it's an object
        let shippingAddress = "N/A"
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

        // Format the order for the frontend
        const formattedOrder = {
            id: order.id,
            orderNumber: `#NB-${order.id.substring(0, 8)}`,
            customerName: order.user?.name || 'Guest',
            customerEmail: order.user?.email || '',
            status: order.status,
            totalAmount: `₹${order.total_amount.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`,
            createdAt: order.created_at,
            shippingAddress,
            items: order.items.map(item => ({
                id: item.id,
                productName: item.product?.name || '',
                quantity: item.quantity,
                price: item.price,
                size: item.product_size?.size || '',
                image: item.product?.images?.[0] || null
            }))
        }

        return NextResponse.json({ order: formattedOrder })
    } catch (error) {
        console.error('Error fetching order:', error)
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
    }
}