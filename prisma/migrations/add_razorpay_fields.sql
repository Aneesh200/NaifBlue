-- Add Razorpay payment fields to orders table
-- Migration: add_razorpay_fields
-- Created: 2026-01-07

-- Add payment_id column for Razorpay order ID
ALTER TABLE "orders" 
ADD COLUMN IF NOT EXISTS "payment_id" TEXT;

-- Add payment_status column with default value
ALTER TABLE "orders" 
ADD COLUMN IF NOT EXISTS "payment_status" TEXT NOT NULL DEFAULT 'pending';

-- Update existing orders to have pending payment status
UPDATE "orders" 
SET "payment_status" = 'pending' 
WHERE "payment_status" IS NULL;

