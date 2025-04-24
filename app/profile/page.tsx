// app/profile/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Clock, Package, ShoppingBag, User } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  addressId: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserData() {
      try {
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/sign-in?redirect=profile');
          return;
        }

        // Get user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*, default_address:default_address_id(id, address_line1, address_line2, city, state, postal_code, country)')
          .eq('id', session.user.id)
          .single();

        if (userError) throw userError;

        // Get user orders (for display in the profile)
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (orderError) throw orderError;
        
        setProfile({
          id: session.user.id,
          email: session.user.email || '',
          name: userData?.name || null,
          phone: userData?.phone || null,
          addressId: userData?.default_address?.id || null,
          addressLine1: userData?.default_address?.address_line1 || null,
          addressLine2: userData?.default_address?.address_line2 || null,
          city: userData?.default_address?.city || null,
          state: userData?.default_address?.state || null,
          postalCode: userData?.default_address?.postal_code || null,
          country: userData?.default_address?.country || null,
        });
        
        setRecentOrders(orderData || []);

        // Get total order count
        const { count, error: countError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id);
          
        if (countError) throw countError;
        
        setOrderCount(count || 0);
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Failed to load your profile data');
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
  }, [router]);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccessMessage(null);
    
    if (!profile) return;
    
    try {
      // Update user data
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: profile.name,
          phone: profile.phone,
          updated_at: new Date()
        })
        .eq('id', profile.id);

      if (userError) throw userError;
      
      // Update or create address
      if (profile.addressLine1 && profile.city && profile.state && profile.postalCode) {
        if (profile.addressId) {
          // Update existing address
          const { error: addressError } = await supabase
            .from('addresses')
            .update({
              address_line1: profile.addressLine1,
              address_line2: profile.addressLine2,
              city: profile.city,
              state: profile.state,
              postal_code: profile.postalCode,
              country: profile.country || 'India',
              updated_at: new Date()
            })
            .eq('id', profile.addressId);
            
          if (addressError) throw addressError;
        } else {
          // Create new address with explicit ID
          const addressId = crypto.randomUUID();
          const currentDate = new Date();
          const { data: newAddress, error: addressError } = await supabase
            .from('addresses')
            .insert({
              id: addressId,
              user_id: profile.id,
              address_line1: profile.addressLine1,
              address_line2: profile.addressLine2,
              city: profile.city,
              state: profile.state,
              postal_code: profile.postalCode,
              country: profile.country || 'India',
              is_default: true,
              created_at: currentDate,
              updated_at: currentDate
            })
            .select()
            .single();
            
          if (addressError) throw addressError;
          
          // Set as default address
          if (newAddress) {
            const { error: defaultError } = await supabase
              .from('users')
              .update({
                default_address_id: newAddress.id,
                updated_at: new Date()
              })
              .eq('id', profile.id);
              
            if (defaultError) throw defaultError;
            
            setProfile(prev => prev ? {...prev, addressId: newAddress.id} : null);
          }
        }
      }
      
      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Status badges styling
  const getStatusStyle = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Account Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold">Account Info</h2>
              </div>
              <div className="border-t pt-4">
                <p className="text-gray-600 mb-1">Email</p>
                <p className="font-medium mb-3">{profile?.email}</p>
                
                <p className="text-gray-600 mb-1">Name</p>
                <p className="font-medium mb-3">{profile?.name || 'Not set'}</p>
                
                <p className="text-gray-600 mb-1">Phone</p>
                <p className="font-medium mb-3">{profile?.phone || 'Not set'}</p>
                
                <p className="text-gray-600 mb-1">Address</p>
                <p className="font-medium">
                  {profile?.addressLine1 ? 
                    `${profile?.addressLine1}, ${profile?.city}, ${profile?.state} ${profile?.postalCode}` 
                    : 'Not set'}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold">Order Summary</h2>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-600">Total Orders</p>
                  <p className="font-medium text-lg">{orderCount}</p>
                </div>
                <Link 
                  href="/orders" 
                  className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700"
                >
                  View All Orders
                </Link>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2">
            {/* Update Profile Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Update Profile</h2>
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    value={profile?.name || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, name: e.target.value} : prev)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="phone" className="block text-gray-700 mb-2">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    value={profile?.phone || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, phone: e.target.value} : prev)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your phone number"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="addressLine1" className="block text-gray-700 mb-2">Address Line 1</label>
                  <input
                    id="addressLine1"
                    type="text"
                    value={profile?.addressLine1 || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, addressLine1: e.target.value} : prev)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Street address"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="addressLine2" className="block text-gray-700 mb-2">Address Line 2 (Optional)</label>
                  <input
                    id="addressLine2"
                    type="text"
                    value={profile?.addressLine2 || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, addressLine2: e.target.value} : prev)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Apartment, suite, unit, etc."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="city" className="block text-gray-700 mb-2">City</label>
                    <input
                      id="city"
                      type="text"
                      value={profile?.city || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, city: e.target.value} : prev)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-gray-700 mb-2">State</label>
                    <input
                      id="state"
                      type="text"
                      value={profile?.state || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, state: e.target.value} : prev)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="State"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="postalCode" className="block text-gray-700 mb-2">Postal Code</label>
                    <input
                      id="postalCode"
                      type="text"
                      value={profile?.postalCode || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, postalCode: e.target.value} : prev)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Postal code"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-gray-700 mb-2">Country</label>
                    <input
                      id="country"
                      type="text"
                      value={profile?.country || 'India'}
                      onChange={(e) => setProfile(prev => prev ? {...prev, country: e.target.value} : prev)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Country"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
            
            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold">Recent Orders</h2>
                </div>
                <Link 
                  href="/orders" 
                  className="text-blue-600 hover:underline"
                >
                  View All
                </Link>
              </div>
              
              {recentOrders.length === 0 ? (
                <div className="py-8 text-center">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">You haven't placed any orders yet.</p>
                  <Link
                    href="/products"
                    className="mt-4 inline-block text-blue-600 hover:underline"
                  >
                    Start shopping
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentOrders.map((order) => {
                        const orderDate = new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        });
                        
                        return (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="font-medium text-gray-900">#{order.id.substring(0, 8)}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {orderDate}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(order.status)}`}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                              ₹{order.total_amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                              <Link
                                href={`/orders/${order.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}