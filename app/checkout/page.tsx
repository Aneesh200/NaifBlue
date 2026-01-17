"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";
import Link from "next/link";
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import Script from 'next/script';

const supabase = createClient();

// Razorpay interface
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState("shipping"); // shipping, login, payment
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  // Calculate order details
  const subtotal = totalPrice();
  const shippingCost = subtotal > 1000 ? 0 : 100; // Free shipping over ₹1000
  const taxRate = 0.18; // 18% GST
  const tax = subtotal * taxRate;
  const total = subtotal + shippingCost + tax;

  // Check auth status on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
          
          // Get user data for prefilling
          try {
            const { data: userData, error } = await supabase
              .from('users')
              .select('*, default_address:default_address_id(id, address_line1, address_line2, city, state, postal_code, country)')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.error("Error fetching user data:", error);
              return;
            }
            
            if (userData) {
              setFormData({
                name: userData.name || '',
                email: userData.email || session.user.email || '',
                phone: userData.phone || '',
                // Use the default address if it exists
                address_line1: userData.default_address?.address_line1 || '',
                address_line2: userData.default_address?.address_line2 || '',
                city: userData.default_address?.city || '',
                state: userData.default_address?.state || '',
                postal_code: userData.default_address?.postal_code || '',
                country: userData.default_address?.country || "India",
              });
            }
          } catch (err) {
            console.error("Error fetching user data:", err);
          }
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
      }
    }
    
    checkAuth();
  }, []);

  // Load Razorpay script manually as fallback
  useEffect(() => {
    const checkRazorpay = () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
        console.log('Razorpay SDK loaded successfully');
        return true;
      }
      return false;
    };

    // Check if already loaded
    if (checkRazorpay()) return;

    // Wait for Next.js Script component to load it
    const interval = setInterval(() => {
      if (checkRazorpay()) {
        clearInterval(interval);
      }
    }, 100);

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!window.Razorpay) {
        console.error('Razorpay SDK failed to load');
        setScriptError(true);
        toast.error('Payment system failed to load. Please refresh the page.');
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Handler for form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  // Continue to next step (login/signin or payment)
  const handleContinue = () => {
    // Validate shipping info
    if (!formData.name || !formData.email || !formData.phone || 
        !formData.address_line1 || !formData.city || 
        !formData.state || !formData.postal_code) {
      setError("Please fill all required fields");
      return;
    }
    
    if (isAuthenticated) {
      // If already logged in, go to payment
      setCurrentStep("payment");
    } else {
      // If not logged in, go to login step
      setCurrentStep("login");
      setLoginData({...loginData, email: formData.email});
    }
  };

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;
      
      setIsAuthenticated(true);
      setCurrentStep("payment");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle guest checkout
  const handleGuestCheckout = () => {
    // Proceed to payment without login
    setCurrentStep("payment");
  };

  // Handle signup
  const handleSignup = async () => {
    router.push(`/sign-up?redirect=checkout&email=${encodeURIComponent(loginData.email)}`);
  };

  // Initiate Razorpay payment
  const initiateRazorpayPayment = async (orderId: string, amount: number) => {
    try {
      // Create Razorpay order
      const paymentResponse = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          order_id: orderId,
          currency: 'INR',
          user_info: {
            name: formData.name,
            email: formData.email,
          },
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      const paymentData = await paymentResponse.json();

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'NaifBleu',
        description: 'Order Payment',
        order_id: paymentData.order_id,
        handler: async (response: any) => {
          // Verify payment
          try {
            setIsProcessingPayment(true);
            const verifyResponse = await fetch('/api/payment', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderId,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error('Payment verification failed');
            }

            // Redirect to success page - cart will be cleared there
            toast.success('Payment successful!');
            const successUrl = `/checkout/success?order_id=${orderId}&payment_id=${response.razorpay_payment_id}`;
            
            // Use window.location.replace to prevent back button issues
            window.location.replace(successUrl);
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
            setIsProcessingPayment(false);
            setIsLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: async () => {
            // Record payment failure
            try {
              await fetch('/api/payment', {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  order_id: orderId,
                  error_description: 'Payment cancelled by user',
                }),
              });
            } catch (error) {
              console.error('Error recording payment failure:', error);
            }
            
            setIsLoading(false);
            toast.error('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      toast.error('Failed to initiate payment');
      setIsLoading(false);
    }
  };

  // Create order and proceed to payment
  const handleCreateOrder = async () => {
    if (!razorpayLoaded) {
      toast.error('Payment system is loading. Please wait...');
      return;
    }

    setIsLoading(true);
    setError("");

    if (items.length === 0) {
      setError("Your cart is empty");
      setIsLoading(false);
      return;
    }

    try {
      // Create a guest user if not authenticated
      let userId = "";
      
      if (!isAuthenticated) {
        // Try to find if email already exists
        const { data: existingUsers, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('email', formData.email);
          
        if (userError) {
          throw new Error(`Error checking existing users: ${userError.message}`);
        }
          
        if (existingUsers && existingUsers.length > 0) {
          // User exists but not logged in
          setError("This email already exists. Please log in to continue.");
          setCurrentStep("login");
          setIsLoading(false);
          return;
        }
        
        // Create a new user record for the guest
        const guestId = crypto.randomUUID();
        const { data, error } = await supabase
          .from('users')
          .insert({
            id: guestId,
            email: formData.email,
            name: formData.name,
            phone: formData.phone,
            role: 'guest'
          })
          .select()
          .single();
          
        if (error) {
          throw new Error(`Error creating guest user record: ${error.message}`);
        }
        
        userId = data.id;
        
        // Create address for guest user with explicit ID
        const addressId = crypto.randomUUID();
        const currentDate = new Date();
        const { data: addressData, error: addressError } = await supabase
          .from('addresses')
          .insert({
            id: addressId,
            user_id: userId,
            address_line1: formData.address_line1,
            address_line2: formData.address_line2,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country,
            is_default: true,
            created_at: currentDate,
            updated_at: currentDate
          })
          .select()
          .single();
          
        if (addressError) {
          throw new Error(`Error creating address: ${addressError.message}`);
        }
        
        // Set as default address via API (bypasses RLS)
        const setDefaultResponse = await fetch('/api/profile/set-default-address', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            addressId: addressData.id,
          }),
        });

        if (!setDefaultResponse.ok) {
          const errorData = await setDefaultResponse.json();
          throw new Error(`Error setting default address: ${errorData.error || 'Unknown error'}`);
        }
      } else {
        // Get current user ID
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error(`Error getting session: ${sessionError?.message || 'No session found'}`);
        }
        
        userId = session.user.id;
        
        // Check if user has a default address
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('default_address_id')
          .eq('id', userId)
          .single();
          
        if (userError) {
          throw new Error(`Error getting user data: ${userError.message}`);
        }
        
        // Update name and phone in user record via API (bypasses RLS)
        const updateResponse = await fetch('/api/profile/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
          }),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(`Error updating user record: ${errorData.error || 'Unknown error'}`);
        }
        
        if (userData.default_address_id) {
          // Update existing address
          const { error: addressError } = await supabase
            .from('addresses')
            .update({
              address_line1: formData.address_line1,
              address_line2: formData.address_line2,
              city: formData.city,
              state: formData.state,
              postal_code: formData.postal_code,
              country: formData.country,
              updated_at: new Date()
            })
            .eq('id', userData.default_address_id);
            
          if (addressError) {
            throw new Error(`Error updating address: ${addressError.message}`);
          }
        } else {
          // Create new address with explicit ID
          const addressId = crypto.randomUUID();
          const currentDate = new Date();
          const { data: addressData, error: addressError } = await supabase
            .from('addresses')
            .insert({
              id: addressId,
              user_id: userId,
              address_line1: formData.address_line1,
              address_line2: formData.address_line2,
              city: formData.city,
              state: formData.state,
              postal_code: formData.postal_code,
              country: formData.country,
              is_default: true,
              created_at: currentDate,
              updated_at: currentDate
            })
            .select()
            .single();
            
          if (addressError) {
            throw new Error(`Error creating address: ${addressError.message}`);
          }
          
          // Set as default address via API (bypasses RLS)
          const setDefaultResponse = await fetch('/api/profile/set-default-address', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              addressId: addressData.id,
            }),
          });

          if (!setDefaultResponse.ok) {
            const errorData = await setDefaultResponse.json();
            throw new Error(`Error setting default address: ${errorData.error || 'Unknown error'}`);
          }
        }
      }
      
      // Create the order
      const orderId = crypto.randomUUID();
      const currentDate = new Date();
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: userId,
          shipping_address: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address_line1: formData.address_line1,
            address_line2: formData.address_line2,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postal_code,
            country: formData.country
          },
          status: 'pending',
          total_amount: total,
          created_at: currentDate,
          updated_at: currentDate
        })
        .select()
        .single();
        
      if (orderError) {
        throw new Error(`Error creating order: ${orderError.message}`);
      }
      
      // Create order items (from cart)
      for (const item of items) {
        const orderItemId = crypto.randomUUID();
        // Get product size ID if needed
        let productSizeId = null;
        if (item.size) {
          // If we have the size field but not size_id, we need to fetch the product size ID
          try {
            const { data: sizeData } = await supabase
              .from('product_sizes')
              .select('id')
              .eq('product_id', item.id)
              .eq('size', item.size)
              .single();
            
            if (sizeData) {
              productSizeId = sizeData.id;
            }
          } catch (sizeError) {
            console.error(`Error fetching size ID: ${sizeError}`);
          }
        }

        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            id: orderItemId,
            order_id: order.id,
            product_id: item.id,
            price: item.price,
            quantity: item.quantity,
            product_size_id: productSizeId,
            created_at: currentDate
          });
          
        if (itemError) {
          console.error(`Error adding order item: ${itemError.message}`);
          // Continue with other items even if one fails
        }
      }
      
      // Initiate Razorpay payment
      await initiateRazorpayPayment(order.id, total);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "An error occurred during checkout. Please try again.");
      setIsLoading(false);
    }
  };

  // Redirect to cart if empty (but not during payment processing)
  useEffect(() => {
    if (items.length === 0 && !isProcessingPayment) {
      router.push("/checkout/cart");
    }
  }, [items, router, isProcessingPayment]);

  if (items.length === 0 && !isProcessingPayment) {
    return null;
  }

  return (
    <>
      {/* Load Razorpay SDK */}
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('Razorpay script loaded via Script component');
          setRazorpayLoaded(true);
          setScriptError(false);
        }}
        onError={(e) => {
          console.error('Razorpay script failed to load:', e);
          setScriptError(true);
          toast.error('Failed to load payment system. Please refresh the page.');
        }}
      />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-light mb-8">Checkout</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-500 text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Shipping Information */}
          {currentStep === "shipping" && (
            <div className="bg-white border border-gray-100 p-6">
              <h2 className="text-xl font-light mb-6">Shipping Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-100 focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-100 focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-100 focus:outline-none focus:border-black"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-100 focus:outline-none focus:border-black"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-100 focus:outline-none focus:border-black"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-100 focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-100 focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Postal Code *</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-100 focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Country</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-100 focus:outline-none focus:border-black"
                  >
                    <option value="India">India</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleContinue}
                  disabled={isLoading}
                  className="w-full bg-black text-white py-3 hover:bg-white hover:text-black border border-black transition-colors duration-200"
                >
                  {isLoading ? "Processing..." : "Continue to Payment"}
                </button>
              </div>
            </div>
          )}
          
          {/* Login Step */}
          {currentStep === "login" && (
            <div className="bg-white border border-gray-100 p-6">
              <h2 className="text-xl font-light mb-6">Login or Continue as Guest</h2>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    className="w-full px-4 py-2 border border-gray-100 focus:outline-none focus:border-black"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    className="w-full px-4 py-2 border border-gray-100 focus:outline-none focus:border-black"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-black text-white py-3 hover:bg-white hover:text-black border border-black transition-colors duration-200"
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleGuestCheckout}
                    className="w-full border border-gray-100 text-gray-500 py-3 hover:border-black hover:text-black transition-colors duration-200"
                  >
                    Continue as Guest
                  </button>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSignup}
                      className="text-sm text-gray-500 hover:text-black"
                    >
                      Don't have an account? Sign up
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
          
          {/* Payment Step */}
          {currentStep === "payment" && (
            <div className="bg-white border border-gray-100 p-6">
              <h2 className="text-xl font-light mb-6">Payment Information</h2>
              <p className="text-gray-500 text-sm mb-6">
                Your order will be processed securely. You will be redirected to our payment gateway to complete your purchase.
              </p>
              
              {scriptError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 text-sm">
                  <p className="font-medium mb-2">Payment system failed to load</p>
                  <p className="mb-3">Please check your internet connection and try refreshing the page.</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700"
                  >
                    Refresh Page
                  </button>
                </div>
              )}
              
              <button
                onClick={handleCreateOrder}
                disabled={isLoading || !razorpayLoaded || scriptError}
                className="w-full bg-black text-white py-3 hover:bg-white hover:text-black border border-black transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {scriptError 
                  ? "Payment System Unavailable" 
                  : !razorpayLoaded 
                    ? "Loading payment system..." 
                    : isLoading 
                      ? "Processing..." 
                      : "Proceed to Payment"
                }
              </button>
            </div>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 p-6">
            <h2 className="text-xl font-light mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-50">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-light">{item.name}</h3>
                    <p className="text-sm text-gray-500">Size: {item.size}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `₹${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax (18% GST)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-light pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
} 