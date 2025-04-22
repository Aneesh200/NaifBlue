'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface ShippingAddress {
  full_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

interface CartSummary {
  items: number;
  subtotal: number;
  shipping: number;
  total: number;
}

export default function ShippingPage() {
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    full_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    phone: '',
  });
  const [cartSummary, setCartSummary] = useState<CartSummary>({
    items: 0,
    subtotal: 0,
    shipping: 100, // Default shipping cost
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadCheckoutData() {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/sign-in?redirect=checkout/shipping');
          return;
        }

        // Check if cart has items
        const { data: cartItems, error: cartError } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', session.user.id);

        if (cartError) throw cartError;
        
        if (!cartItems || cartItems.length === 0) {
          router.push('/checkout/cart');
          return;
        }

        // Calculate cart summary
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = 100; // Fixed shipping cost for now
        
        setCartSummary({
          items: cartItems.length,
          subtotal,
          shipping,
          total: subtotal + shipping,
        });

        // Get user profile for address
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile && profile.shipping_address) {
          setShippingAddress(profile.shipping_address);
        } else if (profile && profile.name) {
          // Pre-fill name from profile
          setShippingAddress(prev => ({
            ...prev,
            full_name: profile.name || '',
            phone: profile.phone || '',
          }));
        }
      } catch (error) {
        console.error('Error loading checkout data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCheckoutData();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/sign-in');
        return;
      }

      // Save shipping address to user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          shipping_address: shippingAddress,
          updated_at: new Date(),
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;
      
      // Create order for payment
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          shipping_address: shippingAddress,
          status: 'pending',
          total_amount: cartSummary.total,
        })
        .select()
        .single();

      if (orderError) throw orderError;
      
      // Redirect to payment page
      router.push(`/checkout/payment?order_id=${order.id}`);
    } catch (error) {
      console.error('Error processing checkout:', error);
      alert('Failed to process checkout');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading checkout...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Shipping Information</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-6">Shipping Address</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={shippingAddress.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="address_line1" className="block text-sm font-medium mb-1">Address Line 1</label>
                <input
                  type="text"
                  id="address_line1"
                  name="address_line1"
                  value={shippingAddress.address_line1}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Street address, apartment, unit, etc."
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="address_line2" className="block text-sm font-medium mb-1">
                  Address Line 2 <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="address_line2"
                  name="address_line2"
                  value={shippingAddress.address_line2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Apartment, suite, floor, etc."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="postal_code" className="block text-sm font-medium mb-1">PIN Code</label>
                  <input
                    type="text"
                    id="postal_code"
                    name="postal_code"
                    value={shippingAddress.postal_code}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              
              <div className="mb-8">
                <label htmlFor="country" className="block text-sm font-medium mb-1">Country</label>
                <select
                  id="country"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="India">India</option>
                </select>
              </div>
              
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => router.push('/checkout/cart')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Return to Cart
                </button>
                
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Processing...' : 'Continue to Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Items ({cartSummary.items})</span>
                <span>₹{cartSummary.subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>₹{cartSummary.shipping.toFixed(2)}</span>
              </div>
              
              <div className="border-t pt-4 flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{cartSummary.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 