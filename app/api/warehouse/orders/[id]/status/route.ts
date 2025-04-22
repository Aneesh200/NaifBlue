import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { ORDER_STATUS } from "@/lib/utils";

// Update order status (for warehouse staff)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated user
    const supabase = createServerClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    });
    
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
    const { status, tracking_number, notes } = await request.json();
    
    // Validate status
    if (!Object.values(ORDER_STATUS).includes(status)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 }
      );
    }
    
    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        tracking_number: tracking_number || undefined,
        warehouse_notes: notes || undefined,
      },
    });
    
    // Create status log entry
    await prisma.orderStatusLog.create({
      data: {
        order_id: id,
        status,
        notes,
        updated_by: user.id,
      },
    });
    
    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
} 