import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { orderId, newStatus } = await request.json();

        if (!orderId || !newStatus) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Update the order status
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: newStatus,
                // Also log the status change
                status_logs: {
                    create: {
                        status: newStatus,
                        updated_by: 'warehouse-staff', // This should be the actual user ID or role
                        notes: `Status updated to ${newStatus}`
                    }
                }
            }
        });

        if (!updatedOrder) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            orderId,
            newStatus
        });

    } catch (error) {
        console.error("Failed to update order status:", error);
        return NextResponse.json(
            { error: "Failed to update order status" },
            { status: 500 }
        );
    }
}