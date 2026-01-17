'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

const supabase = createClient();
import { ArrowLeft, Package, Truck, CheckCircle2, AlertCircle } from 'lucide-react';

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image_url: string;
  quantity: number;
  price: number;
  product_variant?: string;
}

interface ShippingAddress {
  city: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  country: string;
  postal_code: string;
  address_line1: string;
  address_line2?: string;
}

interface Order {
  id: string;
  user_id: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_address: ShippingAddress;
  payment_method: string;
  tracking_number?: string;
  estimated_delivery?: string;
  items?: OrderItem[];
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrderData() {
      try {
        setLoading(true);
        setError(null);
        
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/sign-in?redirect=' + encodeURIComponent(`/orders/${orderId}`));
          return;
        }
        
        // Get order details
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('user_id', session.user.id)
          .single();
          
        if (orderError) throw orderError;
        
        if (!orderData) {
          setError('Order not found or you do not have permission to view it.');
          setLoading(false);
          return;
        }
        
        // Get order items
        const { data: orderItemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);
          
        if (itemsError) throw itemsError;
        
        setOrder(orderData);
        setOrderItems(orderItemsData || []);
      } catch (err) {
        console.error('Error loading order:', err);
        setError('Failed to load order data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    if (orderId) {
      loadOrderData();
    }
  }, [orderId, router]);

  // Format date string
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format address
  const formatAddress = (address: ShippingAddress) => {
    return (
      <div className="text-gray-500">
        <p>{address.name}</p>
        <p>{address.address_line1}</p>
        {address.address_line2 && <p>{address.address_line2}</p>}
        <p>{address.city}, {address.state} {address.postal_code}</p>
        <p>{address.country}</p>
        <p className="mt-2">Phone: {address.phone}</p>
        <p>Email: {address.email}</p>
      </div>
    );
  };

  // Get order status components
  const getOrderStatusStep = (status: string) => {
    const allStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed'];
    const currentIndex = allStatuses.indexOf(status.toLowerCase());
    
    return (
      <div className="mt-8 mb-12">
        <div className="flex items-center justify-between">
          {allStatuses.map((step, index) => (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  index <= currentIndex 
                    ? 'bg-black border-black text-white' 
                    : 'bg-white border-gray-100 text-gray-300'
                }`}
              >
                {index < currentIndex ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <p className={`mt-2 text-sm font-light ${
                index <= currentIndex ? 'text-black' : 'text-gray-400'
              }`}>
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-2 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
            <div 
              className="absolute top-0 left-0 h-full bg-black"
              style={{ 
                width: `${Math.min(100, (currentIndex / (allStatuses.length - 1)) * 100)}%`
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300">
          <div className="flex items-center text-gray-500 mb-4">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <Link 
            href="/orders" 
            className="inline-flex items-center text-gray-500 hover:text-black font-light"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300">
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-light text-gray-500 mb-2">Order Not Found</h2>
            <p className="text-gray-500 mb-8">We couldn't find the order you're looking for.</p>
            <Link 
              href="/orders" 
              className="inline-flex items-center px-4 py-2 bg-black text-white hover:bg-white hover:text-black border border-black transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link 
          href="/orders" 
          className="inline-flex items-center text-gray-500 hover:text-black font-light"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Orders
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-light text-gray-900">Order #{order.id.substring(0, 8)}</h1>
            <span className={`px-3 py-1 text-xs font-light ${getStatusStyle(order.status)}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-light text-gray-500 mb-1">Order Date</h3>
              <p className="text-gray-900">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <h3 className="text-sm font-light text-gray-500 mb-1">Total Amount</h3>
              <p className="text-gray-900">₹{order.total_amount.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-light text-gray-500 mb-1">Shipping Address</h3>
              {formatAddress(order.shipping_address)}
            </div>
            <div>
              <h3 className="text-sm font-light text-gray-500 mb-1">Payment Method</h3>
              <p className="text-gray-900">{order.payment_method || 'Not specified'}</p>
            </div>
          </div>
          
          {order.tracking_number && (
            <div className="mb-6">
              <h3 className="text-sm font-light text-gray-500 mb-1">Tracking Number</h3>
              <div className="flex items-center text-gray-900">
                <Truck className="h-5 w-5 mr-2" />
                <span>{order.tracking_number}</span>
              </div>
              {order.estimated_delivery && (
                <p className="text-sm text-gray-500 mt-1">
                  Estimated delivery by {formatDate(order.estimated_delivery)}
                </p>
              )}
            </div>
          )}
          
          {(order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered') && 
            getOrderStatusStep(order.status)
          }
        </div>
        
        {/* Order Items */}
        <div className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300">
          <h2 className="text-xl font-light text-gray-900 mb-6">Order Items</h2>
          
          {orderItems.length === 0 ? (
            <p className="text-gray-500">No items found for this order.</p>
          ) : (
            <div className="space-y-6">
              {orderItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row">
                  <div className="sm:w-24 h-24 bg-gray-50 rounded overflow-hidden mb-4 sm:mb-0 flex-shrink-0">
                    {item.product_image_url ? (
                      <img 
                        src={item.product_image_url} 
                        alt={item.product_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="sm:ml-6 flex-1">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-light text-gray-900">{item.product_name}</h3>
                        {item.product_variant && (
                          <p className="text-sm text-gray-500 mt-1">Variant: {item.product_variant}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="mt-2">
                      <Link 
                        href={`/products/${item.product_id}`}
                        className="text-sm text-gray-500 hover:text-black font-light"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex justify-between mb-2 text-gray-500">
              <span>Subtotal</span>
              <span>₹{order.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-gray-500">
              <span>Shipping</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between mb-2 text-gray-500">
              <span>Tax</span>
              <span>Included</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-100 mt-2 text-gray-900">
              <span className="font-light">Total</span>
              <span className="font-light">₹{order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 