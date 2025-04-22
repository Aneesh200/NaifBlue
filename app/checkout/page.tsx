"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";
import Link from "next/link";
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [currentStep, setCurrentStep] = useState("shipping"); // shipping, login, payment
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
          
          // Get user profile for prefilling
          try {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            if (error) {
              console.error("Error fetching profile:", error);
              return;
            }
            
            if (profile) {
              setFormData({
                name: profile.name || '',
                email: profile.email || session.user.email || '',
                phone: profile.phone || '',
                address_line1: profile.address?.split(',')[0] || '',
                address_line2: '',
                city: profile.address?.split(',')[1]?.trim() || '',
                state: profile.address?.split(',')[2]?.trim() || '',
                postal_code: profile.address?.split(',')[3]?.trim() || '',
                country: "India",
              });
            }
          } catch (err) {
            console.error("Error fetching profile:", err);
          }
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
      }
    }
    
    checkAuth();
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

  // Create order and proceed to payment
  const handleCreateOrder = async () => {
    setIsLoading(true);
    setError("");

    if (items.length === 0) {
      setError("Your cart is empty");
      setIsLoading(false);
      return;
    }

    try {
      let userId = "";
      
      if (!isAuthenticated) {
        // Try to find if email already exists
        const { data: existingUsers, error: userError } = await supabase
          .from('profiles')
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
        
        // Create a new profile for the guest using server-side API
        const guestId = crypto.randomUUID();
        const profileResponse = await fetch('/api/profile/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: guestId,
            email: formData.email,
          }),
        });

        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(`Error creating guest profile: ${errorData.error}`);
        }

        // Now update the profile with additional info
        const updateResponse = await fetch('/api/profile/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: guestId, // Include the ID for guest profiles
            name: formData.name,
            phone: formData.phone,
            address: `${formData.address_line1}, ${formData.city}, ${formData.state}, ${formData.postal_code}`,
            email: formData.email,
            role: 'guest'
          }),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(`Error updating guest profile: ${errorData.error}`);
        }

        userId = guestId;
      } else {
        // Get current user ID
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          throw new Error(`Error getting session: ${sessionError?.message || 'No session found'}`);
        }
        
        userId = session.user.id;
        
        // Update profile with shipping info using the server-side API
        const profileResponse = await fetch('/api/profile/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            address: `${formData.address_line1}, ${formData.city}, ${formData.state}, ${formData.postal_code}`,
            email: formData.email
          }),
        });
        
        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(`Error updating profile: ${errorData.error}`);
        }
      }
      
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
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
          total_amount: total
        })
        .select()
        .single();
        
      if (orderError) {
        throw new Error(`Error creating order: ${orderError.message}`);
      }
      
      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size || 'One Size'
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) {
        throw new Error(`Error creating order items: ${itemsError.message}`);
      }
      
      // Clear cart and redirect to success
      clearCart();
      toast.success("Order placed successfully!");
      router.push(`/checkout/success?order_id=${order.id}`);
    } catch (err: any) {
      console.error("Order creation error:", err);
      setError(err.message || "Failed to create order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/checkout/cart");
    }
  }, [items, router]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Checkout Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${currentStep === 'shipping' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep === 'shipping' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
            Shipping
          </div>
          <div className="w-10 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center ${currentStep === 'login' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
            Account
          </div>
          <div className="w-10 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center ${currentStep === 'payment' ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${currentStep === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
            Payment
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div>
          <h1 className="text-2xl font-bold mb-6">Checkout</h1>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Shipping Form */}
          {currentStep === 'shipping' && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Shipping Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    name="address_line1"
                    value={formData.address_line1}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    name="address_line2"
                    value={formData.address_line2}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      readOnly
                      className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-50"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleContinue}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Login Form */}
          {currentStep === 'login' && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Account</h2>
              <p className="mb-4 text-gray-600">You can log in or continue as a guest. Creating an account makes it easier to track your orders.</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={handleGuestCheckout}
                  className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-md font-medium"
                >
                  Continue as Guest
                </button>
                <button
                  onClick={handleSignup}
                  className="bg-gray-800 hover:bg-gray-900 text-white py-3 px-4 rounded-md font-medium"
                >
                  Create Account
                </button>
              </div>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or log in</span>
                </div>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    className="w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium disabled:bg-blue-300"
                  >
                    {isLoading ? "Logging in..." : "Log In"}
                  </button>
                </div>
              </form>
              
              <div className="mt-4">
                <button
                  onClick={() => setCurrentStep('shipping')}
                  className="text-blue-600 hover:underline text-sm"
                >
                  ← Back to Shipping
                </button>
              </div>
            </div>
          )}

          {/* Payment Section */}
          {currentStep === 'payment' && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-lg font-medium mb-4">Payment Information</h2>
              <p className="mb-6 text-gray-600">
                This is a demo store. No actual payment will be processed.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-md">
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <p>{formData.name}</p>
                  <p>{formData.address_line1}</p>
                  {formData.address_line2 && <p>{formData.address_line2}</p>}
                  <p>{formData.city}, {formData.state} {formData.postal_code}</p>
                  <p>{formData.country}</p>
                  <p className="mt-2">{formData.phone}</p>
                  <p>{formData.email}</p>
                  
                  <button
                    onClick={() => setCurrentStep('shipping')}
                    className="text-blue-600 hover:underline text-sm mt-2"
                  >
                    Edit
                  </button>
                </div>
                
                <div className="border-t pt-4">
                  <button
                    onClick={handleCreateOrder}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium disabled:bg-blue-300"
                  >
                    {isLoading ? "Processing..." : "Place Order"}
                  </button>
                </div>
              </div>
            </div>
          )}
          
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <div className="bg-white shadow-md rounded-lg p-6 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            {/* Order Items */}
            <div className="mb-4">
              <div className="max-h-80 overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex py-4 border-b">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.name}</h3>
                          <p className="ml-4">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        {item.size && <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>}
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <p className="text-gray-500">Qty {item.quantity}</p>
                        <Link href="/checkout/cart" className="text-blue-600 hover:text-blue-500">
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Price Details */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `₹${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (18% GST)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t mt-2">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              
              {shippingCost === 0 && (
                <div className="text-green-600 text-sm pt-2">
                  You qualified for free shipping!
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <Link 
                href="/checkout/cart"
                className="block text-center text-blue-600 hover:underline"
              >
                Edit Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 