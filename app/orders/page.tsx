'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

const supabase = createClient();
import { Package, Clock, ArrowRight, ShoppingCart } from 'lucide-react';

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  item_count?: number;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        setError(null);

        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push('/sign-in?redirect=/orders');
          return;
        }

        // Get all orders for the user
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*, order_items(id)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // Format the orders with item count
        const formattedOrders = ordersData?.map(order => ({
          ...order,
          item_count: order.order_items ? order.order_items.length : 0
        })) || [];

        setOrders(formattedOrders);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [router]);

  // Status badges styling
  const getStatusStyle = (status: string) => {
    const styles = {
      pending: 'bg-gray-50 text-gray-500 border border-gray-100',
      processing: 'bg-gray-50 text-gray-500 border border-gray-100',
      shipped: 'bg-gray-50 text-gray-500 border border-gray-100',
      delivered: 'bg-gray-50 text-gray-500 border border-gray-100',
      completed: 'bg-gray-50 text-gray-500 border border-gray-100',
      cancelled: 'bg-gray-50 text-gray-500 border border-gray-100',
    };
    
    return styles[status.toLowerCase() as keyof typeof styles] || 'bg-gray-50 text-gray-500 border border-gray-100';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-light mb-8">Your Orders</h1>

      {loading ? (
        <div className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading your orders...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300">
          <p className="text-gray-500">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300">
          <div className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-light text-gray-500 mb-2">No Orders Yet</h2>
            <p className="text-gray-500 mb-8">You haven't placed any orders yet.</p>
            <Link 
              href="/products" 
              className="inline-flex items-center px-4 py-2 bg-black text-white hover:bg-white hover:text-black border border-black transition-colors duration-200"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center">
                    <Clock className="inline-block w-4 h-4 mr-1" /> 
                    {formatDate(order.created_at)}
                  </p>
                  <h2 className="text-xl font-light text-gray-900">
                    Order #{order.id.substring(0, 8)}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs font-light ${getStatusStyle(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <Link 
                    href={`/orders/${order.id}`}
                    className="text-gray-500 hover:text-black font-light text-sm flex items-center"
                  >
                    View Details <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex items-center text-gray-500">
                  <Package className="w-4 h-4 mr-2" />
                  <span>{order.item_count} {order.item_count === 1 ? 'item' : 'items'}</span>
                </div>
                <div className="font-light text-gray-900">
                  Total: ₹{order.total_amount.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 