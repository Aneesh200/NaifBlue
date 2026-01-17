// app/profile/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Clock, Package, ShoppingBag, User, ArrowRight } from 'lucide-react';

const supabase = createClient();

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
      // Update user data via API (bypasses RLS)
      const updateResponse = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
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
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

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
    
    return styles[status as keyof typeof styles] || 'bg-gray-50 text-gray-500 border border-gray-100';
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-light mb-8">My Account</h1>
        
        {error && (
          <div className="bg-white border border-gray-100 text-gray-500 px-4 py-3 mb-6">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-white border border-gray-100 text-gray-500 px-4 py-3 mb-6">
            {successMessage}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Account Summary */}
          <div className="md:col-span-1">
            <div className="bg-white border border-gray-100 p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="bg-gray-50 p-2 rounded-full mr-3">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
                <h2 className="text-xl font-light">Account Info</h2>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <p className="text-gray-500 mb-1">Email</p>
                <p className="font-light mb-3">{profile?.email}</p>
                <p className="text-gray-500 mb-1">Phone</p>
                <p className="font-light">{profile?.phone || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="bg-white border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <div className="bg-gray-50 p-2 rounded-full mr-3">
                  <Package className="h-6 w-6 text-gray-500" />
                </div>
                <h2 className="text-xl font-light">Recent Orders</h2>
              </div>
              <div className="border-t border-gray-100 pt-4">
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Order #{order.id.substring(0, 8)}</p>
                          <p className="text-sm font-light">₹{order.total_amount.toFixed(2)}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-light ${getStatusStyle(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                    ))}
                    <Link 
                      href="/orders"
                      className="text-gray-500 hover:text-black text-sm font-light flex items-center"
                    >
                      View All Orders <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No orders yet</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Profile Form */}
          <div className="md:col-span-2">
            <div className="bg-white border border-gray-100 p-6">
              <h2 className="text-xl font-light mb-6">Update Profile</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm text-gray-500 mb-1">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      value={profile?.name || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, name: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-100 focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm text-gray-500 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      value={profile?.phone || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, phone: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-100 focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address1" className="block text-sm text-gray-500 mb-1">Address Line 1</label>
                  <input
                    type="text"
                    id="address1"
                    value={profile?.addressLine1 || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, addressLine1: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-100 focus:border-black focus:outline-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="address2" className="block text-sm text-gray-500 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    id="address2"
                    value={profile?.addressLine2 || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, addressLine2: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-100 focus:border-black focus:outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm text-gray-500 mb-1">City</label>
                    <input
                      type="text"
                      id="city"
                      value={profile?.city || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, city: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-100 focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm text-gray-500 mb-1">State</label>
                    <input
                      type="text"
                      id="state"
                      value={profile?.state || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, state: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-100 focus:border-black focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm text-gray-500 mb-1">Postal Code</label>
                    <input
                      type="text"
                      id="postalCode"
                      value={profile?.postalCode || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, postalCode: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-100 focus:border-black focus:outline-none"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm text-gray-500 mb-1">Country</label>
                  <input
                    type="text"
                    id="country"
                    value={profile?.country || 'India'}
                    onChange={(e) => setProfile(prev => prev ? {...prev, country: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-100 focus:border-black focus:outline-none"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full bg-black text-white py-2 px-4 hover:bg-white hover:text-black border border-black transition-colors duration-200 disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}