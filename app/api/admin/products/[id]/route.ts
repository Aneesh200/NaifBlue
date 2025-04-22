import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

// Get a specific product
export async function GET(
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
    
    // Verify user is an admin
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      },
    });
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { id } = params;
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        sizes: true,
        school: true,
        category: true,
      },
    });
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// Update a product
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
    
    // Verify user is an admin
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      },
    });
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { id } = params;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // Get product data from request
    const {
      name,
      description,
      price,
      sale_price,
      image_url,
      stock,
      is_active,
      school_id,
      category_id,
      sizes,
    } = await request.json();
    
    // Update the product
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        sale_price,
        image_url,
        stock,
        is_active,
        school_id,
        category_id,
      },
    });
    
    // Update product sizes
    if (sizes && sizes.length > 0) {
      // Delete existing sizes
      await prisma.productSize.deleteMany({
        where: { product_id: id },
      });
      
      // Create new sizes
      await Promise.all(
        sizes.map(async (size: any) => {
          await prisma.productSize.create({
            data: {
              product_id: id,
              size: size.size,
              age_range: size.age_range,
              stock: size.stock,
            },
          });
        })
      );
    }
    
    return NextResponse.json({
      product: {
        ...product,
        sizes: await prisma.productSize.findMany({
          where: { product_id: id },
        }),
      },
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// Delete a product
export async function DELETE(
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
    
    // Verify user is an admin
    const user = await prisma.user.findFirst({
      where: {
        email: session.user.email,
      },
    });
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { id } = params;
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });
    
    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    
    // First delete related sizes
    await prisma.productSize.deleteMany({
      where: { product_id: id },
    });
    
    // Delete related order items
    // Note: In a real application, you might want to handle this differently
    await prisma.orderItem.deleteMany({
      where: { product_id: id },
    });
    
    // Delete related wishlist items
    await prisma.wishlistItem.deleteMany({
      where: { product_id: id },
    });
    
    // Delete the product
    await prisma.product.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
} 