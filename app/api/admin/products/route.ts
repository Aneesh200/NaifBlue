import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

// Create a new product
export async function POST(request: Request) {
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
    
    // Validate required fields
    if (!name || price === undefined) {
      return NextResponse.json(
        { error: "Name and price are required fields" },
        { status: 400 }
      );
    }
    
    // Create the product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        sale_price,
        image_url,
        stock,
        is_active: is_active !== false,
        school_id,
        category_id,
      },
    });
    
    // Create product sizes if provided
    if (sizes && sizes.length > 0) {
      await Promise.all(
        sizes.map(async (size: any) => {
          await prisma.productSize.create({
            data: {
              product_id: product.id,
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
          where: { product_id: product.id },
        }),
      },
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// Get all products
export async function GET(request: Request) {
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
    
    // Get search parameters
    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";
    const categoryId = url.searchParams.get("category") || undefined;
    const schoolId = url.searchParams.get("school") || undefined;
    const active = url.searchParams.get("active");
    
    // Build the filter object
    const filter: any = {};
    
    if (query) {
      filter.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }
    
    if (categoryId) {
      filter.category_id = categoryId;
    }
    
    if (schoolId) {
      filter.school_id = schoolId;
    }
    
    if (active !== null) {
      filter.is_active = active === "true";
    }
    
    // Get products with filters
    const products = await prisma.product.findMany({
      where: filter,
      orderBy: { created_at: "desc" },
      include: {
        school: {
          select: { id: true, name: true },
        },
        category: {
          select: { id: true, name: true },
        },
        sizes: true,
      },
    });
    
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
} 