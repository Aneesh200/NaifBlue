'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const supabase = createClient();

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
  const [userAddressId, setUserAddressId] = useState<string | null>(null);
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

        // Get user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, name, phone, default_address_id')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;

        // If user has a default address, fetch it
        if (userData.default_address_id) {
          const { data: addressData, error: addressError } = await supabase
            .from('addresses')
            .select('*')
            .eq('id', userData.default_address_id)
            .single();

          if (addressError) throw addressError;

          if (addressData) {
            setUserAddressId(addressData.id);
            setShippingAddress({
              full_name: userData.name || '',
              address_line1: addressData.address_line1,
              address_line2: addressData.address_line2 || '',
              city: addressData.city,
              state: addressData.state,
              postal_code: addressData.postal_code,
              country: addressData.country,
              phone: userData.phone || '',
            });
          }
        } else {
          // Just pre-fill name and phone from user data
          setShippingAddress(prev => ({
            ...prev,
            full_name: userData.name || '',
            phone: userData.phone || '',
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

      // Update or create address
      let addressId = userAddressId;
      
      if (addressId) {
        // Update existing address
        const { error: addressError } = await supabase
          .from('addresses')
          .update({
            address_line1: shippingAddress.address_line1,
            address_line2: shippingAddress.address_line2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.postal_code,
            country: shippingAddress.country,
            is_default: true,
            updated_at: new Date(),
          })
          .eq('id', addressId);

        if (addressError) throw addressError;
      } else {
        // Create new address with explicit ID
        addressId = crypto.randomUUID();
        const currentDate = new Date();
        const { data: newAddress, error: addressError } = await supabase
          .from('addresses')
          .insert({
            id: addressId,
            user_id: session.user.id,
            address_line1: shippingAddress.address_line1,
            address_line2: shippingAddress.address_line2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postal_code: shippingAddress.postal_code,
            country: shippingAddress.country,
            is_default: true,
            created_at: currentDate,
            updated_at: currentDate
          })
          .select()
          .single();

        if (addressError) throw addressError;
        
        addressId = newAddress.id;
        
        // Update user with default address via API (bypasses RLS)
        const updateResponse = await fetch('/api/profile/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: shippingAddress.full_name,
            phone: shippingAddress.phone,
            default_address_id: addressId,
          }),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(`Error updating user record: ${errorData.error || 'Unknown error'}`);
        }
      }
      
      // Create order for payment
      const orderId = crypto.randomUUID();
      const currentDate = new Date();
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: session.user.id,
          shipping_address: shippingAddress, // Store as JSON for order record
          status: 'pending',
          total_amount: cartSummary.total,
          created_at: currentDate,
          updated_at: currentDate
        })
        .select()
        .single();

      if (orderError) throw orderError;
      
      // Redirect directly to success page - use window.location for a hard redirect
      window.location.href = `/checkout/success?order_id=${order.id}`;
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