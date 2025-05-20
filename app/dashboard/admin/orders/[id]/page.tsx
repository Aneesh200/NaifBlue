'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, CheckCircle2, AlertCircle, Calendar, CreditCard, MapPin, User } from 'lucide-react';
import { Order, OrderItem, ShippingAddress } from '@/lib/types';

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
            <div className="text-gray-600">
                <p className="font-medium">{address.name}</p>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>{address.city}, {address.state} {address.postal_code}</p>
                <p className="mb-2">{address.country}</p>
                <p className="flex items-center mt-2">
                    <span className="inline-block w-5 h-5 mr-2 text-blue-500">📱</span>
                    {address.phone}
                </p>
                <p className="flex items-center">
                    <span className="inline-block w-5 h-5 mr-2 text-blue-500">✉️</span>
                    {address.email}
                </p>
            </div>
        );
    };

    // Get order status components with vibrant colors
    const getOrderStatusStep = (status: string) => {
        const allStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed'];
        const currentIndex = allStatuses.indexOf(status.toLowerCase());

        // Define vibrant colors for each step
        const colors = {
            pending: { bg: '#EBF5FF', border: '#3B82F6', text: '#2563EB' },      // Blue
            processing: { bg: '#FEF3C7', border: '#F59E0B', text: '#D97706' },   // Amber
            shipped: { bg: '#E0E7FF', border: '#6366F1', text: '#4F46E5' },      // Indigo
            delivered: { bg: '#DCFCE7', border: '#22C55E', text: '#16A34A' },    // Green
            completed: { bg: '#D1FAE5', border: '#10B981', text: '#059669' }     // Emerald
        };

        return (
            <div className="mt-8 mb-12 relative">
                <div className="flex items-center justify-between z-10 relative">
                    {allStatuses.map((step, index) => {
                        const color = colors[step as keyof typeof colors];
                        const isActive = index <= currentIndex;

                        return (
                            <div key={step} className="flex flex-col items-center">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-md transition-all duration-300 ${isActive
                                        ? `bg-white border-[${color.border}]`
                                        : 'bg-white border-gray-200'
                                        }`}
                                    style={{
                                        borderColor: isActive ? color.border : '#e5e7eb',
                                        backgroundColor: isActive ? color.bg : 'white'
                                    }}
                                >
                                    {index < currentIndex ? (
                                        <CheckCircle2 style={{ color: color.text }} className="w-6 h-6" />
                                    ) : index === currentIndex ? (
                                        <span style={{ color: color.text }} className="font-medium">{index + 1}</span>
                                    ) : (
                                        <span className="text-gray-300">{index + 1}</span>
                                    )}
                                </div>
                                <p className={`mt-3 text-sm font-medium ${isActive ? 'text-gray-800' : 'text-gray-400'
                                    }`}>
                                    {step.charAt(0).toUpperCase() + step.slice(1)}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Progress bar with gradient */}
                <div className="mt-2 relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100 rounded-full">
                        <div
                            className="absolute top-0 left-0 h-full rounded-full"
                            style={{
                                width: `${Math.min(100, (currentIndex / (allStatuses.length - 1)) * 100)}%`,
                                background: 'linear-gradient(to right, #3B82F6, #6366F1, #10B981)'
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        );
    };

    // Status badges styling with vibrant colors
    const getStatusStyle = (status: string) => {
        const styles = {
            pending: 'bg-blue-50 text-blue-700 border border-blue-200',
            processing: 'bg-amber-50 text-amber-700 border border-amber-200',
            shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
            delivered: 'bg-green-50 text-green-700 border border-green-200',
            completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            cancelled: 'bg-red-50 text-red-700 border border-red-200',
        };

        return styles[status.toLowerCase() as keyof typeof styles] || 'bg-gray-50 text-gray-700 border border-gray-200';
    };

    // Status Icon based on order status
    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <span className="mr-1">⏱️</span>;
            case 'processing':
                return <span className="mr-1">🔄</span>;
            case 'shipped':
                return <span className="mr-1">🚚</span>;
            case 'delivered':
                return <span className="mr-1">📦</span>;
            case 'completed':
                return <span className="mr-1">✅</span>;
            case 'cancelled':
                return <span className="mr-1">❌</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-6 shadow-sm">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-blue-700 font-medium">Loading your order details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="bg-red-50 border border-red-100 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center text-red-600 mb-4">
                        <AlertCircle className="h-6 w-6 mr-2" />
                        <span className="font-medium">{error}</span>
                    </div>
                    <Link
                        href="/dashboard/admin/orders"
                        className="inline-flex items-center px-4 py-2 bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
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
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 shadow-sm">
                    <div className="text-center py-12">
                        <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h2 className="text-2xl font-medium text-gray-700 mb-2">Order Not Found</h2>
                        <p className="text-gray-500 mb-8">We couldn&apos;t find the order you&apos;re looking for.</p>
                        <Link
                            href="/dashboard/admin/orders"
                            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
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
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Link
                    href="/dashboard/admin/orders"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Orders
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Order Summary Card */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 text-white">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-semibold">Order #{order.id.substring(0, 8)}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                <div className="flex items-center text-blue-700 mb-2">
                                    <Calendar className="h-5 w-5 mr-2" />
                                    <h3 className="font-medium">Order Date</h3>
                                </div>
                                <p className="text-gray-700">{formatDate(order.created_at)}</p>
                            </div>

                            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                                <div className="flex items-center text-green-700 mb-2">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    <h3 className="font-medium">Payment Method</h3>
                                </div>
                                <p className="text-gray-700">{order.payment_method || 'Not specified'}</p>
                                <p className="text-2xl font-bold mt-2 text-gray-800">₹{order.total_amount.toFixed(2)}</p>
                            </div>

                            {order.tracking_number && (
                                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                                    <div className="flex items-center text-indigo-700 mb-2">
                                        <Truck className="h-5 w-5 mr-2" />
                                        <h3 className="font-medium">Tracking Info</h3>
                                    </div>
                                    <div className="text-gray-700">{order.tracking_number}</div>
                                    {order.estimated_delivery && (
                                        <p className="text-sm text-gray-600 mt-1">
                                            Delivery by {formatDate(order.estimated_delivery)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Order Status Tracking */}
                        {(order.status === 'processing' || order.status === 'shipped' ||
                            order.status === 'delivered' || order.status === 'completed') &&
                            getOrderStatusStep(order.status)
                        }

                        {/* Order Details - Customer & Shipping */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                                <div className="flex items-center mb-4 text-gray-900">
                                    <User className="h-5 w-5 mr-2 text-gray-500" />
                                    <h3 className="font-medium">Customer Details</h3>
                                </div>
                                <div className="text-gray-600">
                                    <p className="font-medium">{order.shipping_address.name}</p>
                                    <p>Email: {order.shipping_address.email}</p>
                                    <p>Phone: {order.shipping_address.phone}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                                <div className="flex items-center mb-4 text-gray-900">
                                    <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                                    <h3 className="font-medium">Shipping Address</h3>
                                </div>
                                {formatAddress(order.shipping_address)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Order Items</h2>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {orderItems.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                <p>No items found for this order.</p>
                            </div>
                        ) : (
                            orderItems.map((item) => (
                                <div key={item.id} className="p-6 flex flex-col sm:flex-row">
                                    <div className="sm:w-24 h-24 bg-gray-50 rounded-lg overflow-hidden mb-4 sm:mb-0 flex-shrink-0 border border-gray-200">
                                        {item.product_image_url ? (
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={item.product_image_url}
                                                    alt={item.product_name}
                                                    className="object-cover w-full h-full"
                                                    onError={(e) => {
                                                        // Fallback if image fails to load
                                                        e.currentTarget.onerror = null;
                                                        e.currentTarget.src = "https://placehold.co/100x100?text=Product";
                                                    }}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="h-10 w-10 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="sm:ml-6 flex-1">
                                        <div className="flex justify-between mb-2">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-800">{item.product_name}</h3>
                                                {item.product_variant && (
                                                    <div className="mt-1 inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md">
                                                        {item.product_variant}
                                                    </div>
                                                )}
                                                <p className="text-sm text-gray-500 mt-2">
                                                    Quantity: <span className="font-medium text-gray-700">{item.quantity}</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-medium text-gray-800">
                                                    ₹{(item.price * item.quantity).toFixed(2)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ₹{item.price.toFixed(2)} each
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <Link
                                                href={`/products/${item.product_id}`}
                                                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                                            >
                                                View Product
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="bg-gray-50 px-6 py-4">
                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex justify-between mb-2 text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{order.total_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between mb-2 text-gray-600">
                                <span>Shipping</span>
                                <span>₹0.00</span>
                            </div>
                            <div className="flex justify-between mb-2 text-gray-600">
                                <span>Tax</span>
                                <span>Included</span>
                            </div>
                            <div className="flex justify-between pt-4 border-t border-gray-200 mt-2 text-gray-900">
                                <span className="font-medium">Total</span>
                                <span className="font-bold text-xl">₹{order.total_amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}