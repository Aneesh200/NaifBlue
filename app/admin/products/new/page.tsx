import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import ProductForm from "@/app/components/admin/ProductForm";

export default async function NewProductPage() {
  // Get the authenticated user
  const supabase = createServerClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect("/");
  }
  
  // Get user from database
  const user = await prisma.user.findFirst({
    where: {
      email: session.user.email,
    },
  });
  
  // Check if user has admin role
  if (!user || user.role !== "admin") {
    redirect("/");
  }
  
  // Get all schools and categories for the form
  const schools = await prisma.school.findMany({
    orderBy: {
      name: "asc",
    },
  });
  
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <ProductForm schools={schools} categories={categories} />
    </div>
  );
} 