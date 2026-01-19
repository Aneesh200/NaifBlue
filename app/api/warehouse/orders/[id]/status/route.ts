import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { ORDER_STATUS } from "@/lib/utils";
import { sendOrderFulfilledEmail } from "@/lib/email";

// Update order status (for warehouse staff)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Verify user is warehouse staff
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      },
    });
    
    if (!user || (user.role !== "warehouse" && user.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { id } = params;
    
    // Get request data
    const { status, delivery_link, notes } = await request.json();
    
    // Validate status
    if (!Object.values(ORDER_STATUS).includes(status)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      );
    }

    // If status is fulfilled, delivery_link is required
    if (status === ORDER_STATUS.FULFILLED && !delivery_link) {
      return NextResponse.json(
        { error: "Delivery link is required for fulfilled orders" },
        { status: 400 }
      );
    }
    
    // Get order details before updating (for email)
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        delivery_link: delivery_link || undefined,
      },
    });
    
    // Create status log entry
    await prisma.orderStatusLog.create({
      data: {
        order_id: id,
        status,
        notes: notes || `Order marked as ${status}`,
        updated_by: user.id,
      },
    });

    // Send email if status is fulfilled
    if (status === ORDER_STATUS.FULFILLED && delivery_link) {
      try {
        await sendOrderFulfilledEmail({
          orderId: order.id,
          customerName: order.user.name || 'Customer',
          customerEmail: order.user.email,
          totalAmount: order.total_amount,
          items: order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress: order.shipping_address,
          deliveryLink: delivery_link,
        });
        console.log('Fulfillment email sent successfully');
      } catch (emailError) {
        console.error('Error sending fulfillment email:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
} 