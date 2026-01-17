import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { amount, order_id, currency = "INR", user_info } = await request.json();

    // Validate inputs
    if (!amount || !order_id) {
      return NextResponse.json(
        { error: "Amount and order_id are required" },
        { status: 400 }
      );
    }

    // Get order details from database
    const order = await prisma.order.findUnique({
      where: { id: order_id },
      include: {
        user: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Amount in smallest currency unit (paise)
      currency,
      receipt: order_id,
      notes: {
        order_id: order_id,
        user_email: user_info?.email || order.user?.email || "guest",
        user_name: user_info?.name || order.user?.name || "Guest User",
      },
    });

    // Update the order with Razorpay payment ID
    await prisma.order.update({
      where: { id: order_id },
      data: { 
        payment_id: razorpayOrder.id,
        payment_status: "pending",
      },
    });

    return NextResponse.json({ 
      order_id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}

// Verify payment signature
export async function PUT(request: Request) {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      order_id,
    } = await request.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !order_id) {
      return NextResponse.json(
        { error: "Missing required payment verification fields" },
        { status: 400 }
      );
    }

    // Validate the payment signature
    const crypto = require('crypto');
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Payment is successful, update order status
      await prisma.order.update({
        where: { id: order_id },
        data: { 
          payment_status: "completed",
          status: "processing",
          updated_at: new Date(),
        },
      });

      // Create status log entry
      await prisma.orderStatusLog.create({
        data: {
          order_id,
          status: "processing",
          notes: `Payment received successfully. Razorpay Payment ID: ${razorpay_payment_id}`,
          updated_by: "system",
        },
      });

      return NextResponse.json({ 
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      // Invalid signature
      await prisma.order.update({
        where: { id: order_id },
        data: { 
          payment_status: "failed",
          updated_at: new Date(),
        },
      });

      // Create failed payment log
      await prisma.orderStatusLog.create({
        data: {
          order_id,
          status: "pending",
          notes: "Payment verification failed: Invalid signature",
          updated_by: "system",
        },
      });

      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}

// Handle payment failure
export async function PATCH(request: Request) {
  try {
    const { order_id, error_description } = await request.json();

    if (!order_id) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Update order status to failed
    await prisma.order.update({
      where: { id: order_id },
      data: { 
        payment_status: "failed",
        updated_at: new Date(),
      },
    });

    // Create failed payment log
    await prisma.orderStatusLog.create({
      data: {
        order_id,
        status: "pending",
        notes: `Payment failed: ${error_description || "Unknown error"}`,
        updated_by: "system",
      },
    });

    return NextResponse.json({ 
      success: true,
      message: "Payment failure recorded",
    });
  } catch (error) {
    console.error("Payment failure recording error:", error);
    return NextResponse.json(
      { error: "Failed to record payment failure" },
      { status: 500 }
    );
  }
} 