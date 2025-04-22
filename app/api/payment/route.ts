import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { amount, order_id, currency = "INR" } = await request.json();

    // Validate inputs
    if (!amount || !order_id) {
      return NextResponse.json(
        { error: "Amount and order_id are required" },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Amount in smallest currency unit (paise)
      currency,
      receipt: order_id,
    });

    // Update the order with payment ID
    await prisma.order.update({
      where: { id: order_id },
      data: { payment_id: razorpayOrder.id },
    });

    return NextResponse.json({ 
      order_id: razorpayOrder.id,
      currency: razorpayOrder.currency,
      amount: razorpayOrder.amount,
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

    // Validate the payment
    const generated_signature = require('crypto')
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature === razorpay_signature) {
      // Payment is successful, update order status
      await prisma.order.update({
        where: { id: order_id },
        data: { 
          payment_status: "completed",
          status: "processing" 
        },
      });

      // Create status log entry
      await prisma.orderStatusLog.create({
        data: {
          order_id,
          status: "processing",
          notes: "Payment received successfully",
          updated_by: "system",
        },
      });

      return NextResponse.json({ success: true });
    } else {
      // Invalid signature
      await prisma.order.update({
        where: { id: order_id },
        data: { payment_status: "failed" },
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