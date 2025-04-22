import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export default async function AdminDashboard() {
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
  
  // Get stats for the dashboard
  const productCount = await prisma.product.count();
  const orderCount = await prisma.order.count();
  const pendingOrderCount = await prisma.order.count({
    where: {
      status: {
        in: ["pending", "processing"],
      },
    },
  });
  const userCount = await prisma.user.count();
  
  // Get recent products
  const recentProducts = await prisma.product.findMany({
    take: 5,
    orderBy: {
      created_at: "desc",
    },
  });
  
  // Get recent orders
  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: {
      created_at: "desc",
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div>
          <Link
            href="/admin/products/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add New Product
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm uppercase">Total Products</h2>
          <p className="text-3xl font-bold">{productCount}</p>
          <Link href="/admin/products" className="text-blue-600 text-xs mt-1 inline-block">
            View all
          </Link>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm uppercase">Total Orders</h2>
          <p className="text-3xl font-bold">{orderCount}</p>
          <Link href="/admin/orders" className="text-blue-600 text-xs mt-1 inline-block">
            View all
          </Link>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm uppercase">Pending Orders</h2>
          <p className="text-3xl font-bold">{pendingOrderCount}</p>
          <span className="text-amber-600 text-xs mt-1 inline-block">
            Requires attention
          </span>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm uppercase">Customers</h2>
          <p className="text-3xl font-bold">{userCount}</p>
          <Link href="/admin/users" className="text-blue-600 text-xs mt-1 inline-block">
            View all
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Products</h2>
            <Link href="/admin/products" className="text-blue-600 text-sm">
              View all
            </Link>
          </div>
          
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                  Name
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                  Price
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                  Stock
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="py-2">{product.name}</td>
                  <td className="py-2">{formatPrice(product.price)}</td>
                  <td className="py-2">{product.stock}</td>
                  <td className="py-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-blue-600 text-sm">
              View all
            </Link>
          </div>
          
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                  ID
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                  Customer
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider pb-2">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="py-2">{order.id.slice(0, 8)}...</td>
                  <td className="py-2">{order.user.name || order.user.email}</td>
                  <td className="py-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "shipped"
                          ? "bg-purple-100 text-purple-800"
                          : order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2">{formatPrice(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/admin/products/new"
              className="bg-gray-100 hover:bg-gray-200 p-4 rounded-md text-center"
            >
              Add New Product
            </Link>
            <Link
              href="/admin/categories"
              className="bg-gray-100 hover:bg-gray-200 p-4 rounded-md text-center"
            >
              Manage Categories
            </Link>
            <Link
              href="/admin/schools"
              className="bg-gray-100 hover:bg-gray-200 p-4 rounded-md text-center"
            >
              Manage Schools
            </Link>
            <Link
              href="/admin/coupons"
              className="bg-gray-100 hover:bg-gray-200 p-4 rounded-md text-center"
            >
              Manage Coupons
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Database</span>
              <span className="text-green-600">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Storage</span>
              <span className="text-green-600">Online</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Gateway</span>
              <span className="text-green-600">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email Service</span>
              <span className="text-green-600">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 