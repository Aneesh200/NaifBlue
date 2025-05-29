//TO-DO Add supabase auth

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const timeFilter = searchParams.get('timeFilter') || 'week';

        // Calculate date range
        const now = new Date();
        const startDate = new Date();

        switch (timeFilter) {
            case 'day':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }
        const previousPeriodStart = new Date(startDate);
        const timeDifference = now.getTime() - startDate.getTime();
        previousPeriodStart.setTime(startDate.getTime() - timeDifference);


        const [
            currentOrderStats,
            currentCustomers,
        ] = await Promise.all([
            // Orders and revenue
            prisma.order.aggregate({
                _count: { id: true },
                _sum: { total_amount: true },
                where: {
                    created_at: { gte: startDate },
                    status: { not: 'CANCELLED' }
                }
            }),

            // New customers
            prisma.user.count({
                where: {
                    created_at: { gte: startDate },
                    role: 'CUSTOMER'
                }
            }),
        ]);

        const [
            previousOrderStats,
            previousCustomers
        ] = await Promise.all([
            prisma.order.aggregate({
                _count: { id: true },
                _sum: { total_amount: true },
                where: {
                    created_at: {
                        gte: previousPeriodStart,
                        lt: startDate
                    },
                    status: { not: 'CANCELLED' }
                }
            }),

            prisma.user.count({
                where: {
                    created_at: {
                        gte: previousPeriodStart,
                        lt: startDate
                    },
                    role: 'CUSTOMER'
                }
            })
        ]);

        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return { change: "+100%", positive: true };
            const percentChange = ((current - previous) / previous) * 100;
            return {
                change: `${percentChange >= 0 ? '+' : ''}${Math.abs(percentChange).toFixed(0)}%`,
                positive: percentChange >= 0
            };
        };

        const orderCount = currentOrderStats._count?.id || 0;
        const prevOrderCount = previousOrderStats._count?.id || 0;
        const orderChange = calculateChange(orderCount, prevOrderCount);

        const revenue = currentOrderStats._sum?.total_amount || 0;
        const prevRevenue = previousOrderStats._sum?.total_amount || 0;
        const revenueChange = calculateChange(revenue, prevRevenue);

        const customerChange = calculateChange(currentCustomers, previousCustomers);


        const inventoryChange = { change: '+2%', positive: true };

        // Format response
        return NextResponse.json({
            totalOrders: {
                value: orderCount.toString(),
                change: orderChange.change,
                positive: orderChange.positive
            },
            totalRevenue: {
                value: `₹${revenue.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`,
                change: revenueChange.change,
                positive: revenueChange.positive
            },
            newCustomers: {
                value: currentCustomers.toString(),
                change: customerChange.change,
                positive: customerChange.positive
            },
            inventory: {
                value: `${(1000).toLocaleString()} items`,
                change: inventoryChange.change,
                positive: inventoryChange.positive
            }
        });
    } catch (error) {
        console.error('Error in admin route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
