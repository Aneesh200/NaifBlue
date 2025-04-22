'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore, CartItem } from '@/lib/store';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const [updating, setUpdating] = useState(false);
  const { items, removeItem, updateQuantity, totalPrice, itemCount } = useCartStore();

  const handleUpdateQuantity = (id: string, size: string | undefined, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdating(true);
    updateQuantity(id, newQuantity, size);
    setUpdating(false);
  };

  const handleRemoveItem = (id: string, size: string | undefined) => {
    setUpdating(true);
    removeItem(id, size);
    setUpdating(false);
  };

  const proceedToCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      
      {items.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="border-b px-6 py-4">
                <h2 className="text-lg font-semibold">Items ({itemCount()})</h2>
              </div>
              
              <ul className="divide-y">
                {items.map((item) => (
                  <li key={`${item.id}-${item.size}`} className="px-6 py-6">
                    <div className="flex flex-col sm:flex-row">
                      {/* Product Image */}
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mb-4 sm:mb-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="sm:ml-6 flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-base font-medium">{item.name}</h3>
                            {item.size && <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>}
                            <p className="mt-1 text-sm text-gray-500">₹{item.price.toFixed(2)}</p>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-base font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.size, item.quantity - 1)}
                              disabled={updating || item.quantity <= 1}
                              className="px-3 py-1 border-r border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            >
                              -
                            </button>
                            <span className="px-4 py-1">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.size, item.quantity + 1)}
                              disabled={updating}
                              className="px-3 py-1 border-l border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.id, item.size)}
                            disabled={updating}
                            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="border-t px-6 py-4">
                <button
                  onClick={() => router.push('/products')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{totalPrice().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>Calculated at next step</span>
                </div>
                
                <div className="border-t pt-4 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{totalPrice().toFixed(2)}</span>
                </div>
              </div>
              
              <button
                onClick={proceedToCheckout}
                disabled={items.length === 0 || updating}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 