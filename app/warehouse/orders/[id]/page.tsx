import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, ORDER_STATUS } from "@/lib/utils";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import OrderStatusUpdate from "@/app/components/warehouse/OrderStatusUpdate";

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
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
  
  // Check if user has warehouse or admin role
  if (!user || (user.role !== "warehouse" && user.role !== "admin")) {
    redirect("/");
  }
  
  const { id } = params;
  
  // Get order details
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });
  
  if (!order) {
    redirect("/warehouse");
  }
  
  // Get order status history
  const statusLogs = await prisma.orderStatusLog.findMany({
    where: { order_id: id },
    orderBy: { created_at: "desc" },
  });
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Link
          href="/warehouse"
          className="text-blue-600 hover:text-blue-800 mr-4"
        >
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold">Order Details</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Information</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Order ID</h3>
                <p>{order.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                <p>{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                <p>{order.user.name || order.user.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Payment Status
                </h3>
                <p
                  className={
                    order.payment_status === "completed"
                      ? "text-green-600"
                      : order.payment_status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }
                >
                  {order.payment_status.charAt(0).toUpperCase() +
                    order.payment_status.slice(1)}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Shipping Address
              </h3>
              <div className="bg-gray-50 p-3 rounded">
                {/* Display shipping address from JSON */}
                {Object.entries(order.shipping_address as any).map(
                  ([key, value]) => (
                    <div key={key} className="mb-1">
                      <span className="capitalize">{key.replace("_", " ")}:</span>{" "}
                      {String(value)}
                    </div>
                  )
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Order Status
              </h3>
              <div className="flex items-center">
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
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                
                {order.tracking_number && (
                  <div className="ml-4">
                    <span className="text-sm text-gray-500">Tracking:</span>{" "}
                    <span className="font-medium">{order.tracking_number}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                    Product
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                    Price
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                    Quantity
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3">
                      <div className="flex items-center">
                        {item.product.image_url && item.product.image_url[0] && (
                          <img
                            src={item.product.image_url[0]}
                            alt={item.product.name}
                            className="w-10 h-10 object-cover rounded mr-3"
                          />
                        )}
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                          {item.size && (
                            <div className="text-sm text-gray-500">
                              Size: {item.size}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">{formatPrice(item.price)}</td>
                    <td className="py-3">{item.quantity}</td>
                    <td className="py-3">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-200">
                  <td colSpan={3} className="py-3 text-right font-medium">
                    Subtotal:
                  </td>
                  <td className="py-3">{formatPrice(order.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-2 text-right font-medium">
                    Shipping:
                  </td>
                  <td className="py-2">{formatPrice(order.shipping_cost)}</td>
                </tr>
                {order.discount > 0 && (
                  <tr>
                    <td colSpan={3} className="py-2 text-right font-medium">
                      Discount:
                    </td>
                    <td className="py-2 text-green-600">
                      -{formatPrice(order.discount)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="py-2 text-right font-medium">
                    Tax:
                  </td>
                  <td className="py-2">{formatPrice(order.tax)}</td>
                </tr>
                <tr className="border-t border-gray-200">
                  <td
                    colSpan={3}
                    className="py-3 text-right font-medium text-lg"
                  >
                    Total:
                  </td>
                  <td className="py-3 font-bold">{formatPrice(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div>
          <OrderStatusUpdate
            orderId={order.id}
            currentStatus={order.status}
            trackingNumber={order.tracking_number || ""}
            notes={order.warehouse_notes || ""}
          />
          
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Status History</h2>
            
            <div className="space-y-4">
              {statusLogs.map((log) => (
                <div
                  key={log.id}
                  className="border-l-4 border-blue-600 pl-4 py-1"
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : log.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : log.status === "shipped"
                          ? "bg-purple-100 text-purple-800"
                          : log.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  {log.notes && (
                    <div className="text-sm mt-1">{log.notes}</div>
                  )}
                </div>
              ))}
              
              {statusLogs.length === 0 && (
                <p className="text-gray-500">No status history available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 