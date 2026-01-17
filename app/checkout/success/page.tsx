'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useCartStore } from '@/lib/store';
import Link from 'next/link';

const supabase = createClient();
import { CheckCircle } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCartStore();
  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    async function fetchOrder() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
        
        // Clear cart after successfully loading order
        clearCart();
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, router, clearCart]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
        <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
        <Link 
          href="/"
          className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
        
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="font-medium text-xs break-all">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{orderDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium">₹{order.total_amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium capitalize">{order.status}</p>
            </div>
            {paymentId && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Payment ID</p>
                <p className="font-medium text-xs break-all text-green-600">{paymentId}</p>
              </div>
            )}
          </div>
        </div>
        
        {paymentId ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
            <p className="text-green-800">
              <strong>Payment Successful!</strong> Your payment has been processed securely through Razorpay.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-blue-800">
              Your order has been placed. Please complete the payment to process your order.
            </p>
          </div>
        )}
        
        <p className="text-gray-600 mb-8">
          We've sent a confirmation email with the order details to your registered email address.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/"
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700"
          >
            Continue Shopping
          </Link>
          <Link 
            href="/profile"
            className="border border-gray-300 py-3 px-6 rounded-lg font-medium hover:bg-gray-50"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
} 