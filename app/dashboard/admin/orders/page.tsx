"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Search,
    Filter,
    ArrowLeft,
    ArrowRight,
    Package,
    Calendar,
    User,
    ShoppingBag,
    Clock,
    Eye,
    Edit2
} from 'lucide-react'
import { Order } from '@/lib/types'

const OrdersPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get query params with defaults
    const currentPage = parseInt(searchParams.get('page') || '1')
    const currentStatus = searchParams.get('status') || ''
    const currentSearch = searchParams.get('search') || ''

    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalOrders: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    })

    const [statusFilter, setStatusFilter] = useState(currentStatus)
    const [searchQuery, setSearchQuery] = useState(currentSearch)

    // Status options for the filter
    const statusOptions = [
        { value: '', label: 'All Orders' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'PROCESSING', label: 'Processing' },
        { value: 'CONFIRMED', label: 'Confirmed' },
        { value: 'SHIPPED', label: 'Shipped' },
        { value: 'DELIVERED', label: 'Delivered' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' }
    ]

    // Fetch orders when page, status, or search changes
    useEffect(() => {
        fetchOrders(currentPage, currentStatus, currentSearch)
    }, [currentPage, currentStatus, currentSearch])

    const fetchOrders = async (page: number, status: string, search: string) => {
        setLoading(true)
        try {
            // Build query string
            const queryParams = new URLSearchParams()
            queryParams.set('page', page.toString())
            queryParams.set('limit', '10')

            if (status) queryParams.set('status', status)
            if (search) queryParams.set('search', search)

            const response = await fetch(`/api/admin/dashboard/orders?${queryParams.toString()}`)

            if (!response.ok) {
                throw new Error('Failed to fetch orders')
            }

            const data = await response.json()
            setOrders(data.orders || [])
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    // Apply filters and navigate
    const applyFilters = () => {
        const queryParams = new URLSearchParams()
        queryParams.set('page', '1') // Reset to page 1

        if (statusFilter) queryParams.set('status', statusFilter)
        if (searchQuery) queryParams.set('search', searchQuery)

        router.push(`/dashboard/admin/orders?${queryParams.toString()}`)
    }

    // Navigate to specific page
    const goToPage = (page: number) => {
        const queryParams = new URLSearchParams(searchParams.toString())
        queryParams.set('page', page.toString())
        router.push(`/dashboard/admin/orders?${queryParams.toString()}`)
    }

    // Handle status badge colors
    const getStatusStyle = (status: string) => {
        const styles = {
            PENDING: {
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                border: 'border-blue-200',
                icon: <Clock className="w-3 h-3 mr-1" />
            },
            PROCESSING: {
                bg: 'bg-yellow-50',
                text: 'text-yellow-700',
                border: 'border-yellow-200',
                icon: <Package className="w-3 h-3 mr-1" />
            },
            CONFIRMED: {
                bg: 'bg-indigo-50',
                text: 'text-indigo-700',
                border: 'border-indigo-200',
                icon: <ShoppingBag className="w-3 h-3 mr-1" />
            },
            SHIPPED: {
                bg: 'bg-purple-50',
                text: 'text-purple-700',
                border: 'border-purple-200',
                icon: <Package className="w-3 h-3 mr-1" />
            },
            DELIVERED: {
                bg: 'bg-green-50',
                text: 'text-green-700',
                border: 'border-green-200',
                icon: <Package className="w-3 h-3 mr-1" />
            },
            COMPLETED: {
                bg: 'bg-emerald-50',
                text: 'text-emerald-700',
                border: 'border-emerald-200',
                icon: <Package className="w-3 h-3 mr-1" />
            },
            CANCELLED: {
                bg: 'bg-red-50',
                text: 'text-red-700',
                border: 'border-red-200',
                icon: <Package className="w-3 h-3 mr-1" />
            },
            FAILED: {
                bg: 'bg-red-50',
                text: 'text-red-700',
                border: 'border-red-200',
                icon: <Package className="w-3 h-3 mr-1" />
            }
        };

        const statusKey = status?.toUpperCase() as keyof typeof styles;
        return styles[statusKey] || {
            bg: 'bg-gray-50',
            text: 'text-gray-700',
            border: 'border-gray-200',
            icon: <Package className="w-3 h-3 mr-1" />
        };
    }

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    // Get stats summary
    const getOrderStats = () => {
        if (orders.length === 0) return null;

        let pending = 0, processing = 0, completed = 0, cancelled = 0;

        orders.forEach((order: Order) => {
            const status = order.status.toUpperCase();
            if (status === 'PENDING') pending++;
            else if (['PROCESSING', 'CONFIRMED', 'SHIPPED'].includes(status)) processing++;
            else if (['COMPLETED', 'DELIVERED'].includes(status)) completed++;
            else if (['CANCELLED', 'FAILED'].includes(status)) cancelled++;
        });

        return { pending, processing, completed, cancelled };
    }

    const stats = getOrderStats();

    // Handle the "Enter" key in the search input
    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    }

    return (
        <div className="p-6 bg-white rounded-lg">
            <div className="mb-8">
                <h1 className="text-3xl font-semibold text-gray-800 mb-2">Orders</h1>
                <p className="text-gray-500">Manage and track all customer orders</p>
            </div>

            {/* Order Stats Cards */}
            {!loading && stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-blue-600 font-medium">Pending</p>
                                <p className="text-2xl font-bold text-blue-800">{stats.pending}</p>
                            </div>
                            <div className="bg-blue-100 rounded-full p-3">
                                <Clock className="h-6 w-6 text-blue-700" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-yellow-600 font-medium">Processing</p>
                                <p className="text-2xl font-bold text-yellow-800">{stats.processing}</p>
                            </div>
                            <div className="bg-yellow-100 rounded-full p-3">
                                <ShoppingBag className="h-6 w-6 text-yellow-700" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-100 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-green-600 font-medium">Completed</p>
                                <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
                            </div>
                            <div className="bg-green-100 rounded-full p-3">
                                <Package className="h-6 w-6 text-green-700" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 shadow-sm">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-red-600 font-medium">Cancelled</p>
                                <p className="text-2xl font-bold text-red-800">{stats.cancelled}</p>
                            </div>
                            <div className="bg-red-100 rounded-full p-3">
                                <Package className="h-6 w-6 text-red-700" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search and Filter Bar */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Search input */}
                    <div className="relative flex-grow">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Search order #, customer name or email..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Status filter */}
                    <div className="relative w-full sm:w-auto min-w-[180px]">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Filter className="h-4 w-4" />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    {/* Apply filters button */}
                    <button
                        onClick={applyFilters}
                        className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Orders Cards (Mobile View) */}
            <div className="block md:hidden mb-6">
                {loading ? (
                    // Loading skeleton for mobile
                    [...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-4 animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                            <div className="flex justify-between items-center mb-3">
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                            </div>
                            <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="flex justify-end">
                                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </div>
                    ))
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-100">
                        <Package className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
                        <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you&apos;re looking for.</p>
                    </div>
                ) : (
                    orders.map((order: Order) => {
                        const statusStyle = getStatusStyle(order.status);

                        return (
                            <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <Link href={`/dashboard/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                                            {order.orderNumber}
                                        </Link>
                                        <p className="text-gray-500 text-sm">{formatDate(order.created_at)}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                                        {statusStyle.icon}
                                        {order.status}
                                    </span>
                                </div>

                                <div className="mb-3">
                                    <div className="font-medium text-gray-800">{order.customerName}</div>
                                    <div className="text-gray-500 text-sm">{order.customerEmail}</div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="text-sm">
                                        <span className="text-gray-500">{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</span>
                                        <span className="mx-2">•</span>
                                        <span className="font-medium text-gray-800">{order.totalAmount}</span>
                                    </div>

                                    <div>
                                        <Link
                                            href={`/dashboard/admin/orders/${order.id}`}
                                            className="inline-flex items-center justify-center rounded-md px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100"
                                        >
                                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Orders Table (Desktop View) */}
            <div className="hidden md:block mb-6">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                                <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                <th className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                // Loading skeleton for desktop
                                [...Array(10)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(7)].map((_, j) => (
                                            <td key={j} className="py-4 px-4">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                // No orders found
                                <tr>
                                    <td colSpan={7} className="py-12 px-4 text-center">
                                        <Package className="mx-auto h-12 w-12 text-gray-300" />
                                        <h3 className="mt-2 text-lg font-medium text-gray-900">No orders found</h3>
                                        <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you&apos;re looking for.</p>
                                    </td>
                                </tr>
                            ) : (
                                // Orders list
                                orders.map((order: Order) => {
                                    const statusStyle = getStatusStyle(order.status);

                                    return (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <Link
                                                    href={`/dashboard/admin/orders/${order.id}`}
                                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    {order.orderNumber}
                                                </Link>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="font-medium text-gray-800">{order.customerName}</div>
                                                        <div className="text-gray-500 text-sm">{order.customerEmail}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 text-gray-400 mr-1.5" />
                                                    <span>{formatDate(order.created_at)}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text} border ${statusStyle.border}`}>
                                                    {statusStyle.icon}
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <ShoppingBag className="h-4 w-4 text-gray-400 mr-1.5" />
                                                    <span>{order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap font-medium">{order.totalAmount}</td>
                                            <td className="py-4 px-4 text-right text-sm whitespace-nowrap">
                                                <Link
                                                    href={`/dashboard/admin/orders/${order.id}`}
                                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mr-3"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Link>
                                                <button className="inline-flex items-center text-gray-600 hover:text-gray-800">
                                                    <Edit2 className="h-4 w-4 mr-1" />
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {!loading && orders.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                        <span className="font-medium">
                            {Math.min(pagination.page * pagination.limit, pagination.totalOrders)}
                        </span>{' '}
                        of <span className="font-medium">{pagination.totalOrders}</span> results
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={() => goToPage(pagination.page - 1)}
                            disabled={!pagination.hasPrevPage}
                            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${pagination.hasPrevPage
                                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                }`}
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Previous
                        </button>

                        {/* Page Numbers */}
                        <div className="hidden sm:flex space-x-1">
                            {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                                let pageNum = 1;

                                if (pagination.totalPages <= 5) {
                                    pageNum = idx + 1;
                                } else {
                                    const middle = Math.min(
                                        Math.max(3, pagination.page),
                                        pagination.totalPages - 2
                                    );
                                    pageNum = idx + middle - 2;
                                }

                                if (pageNum > 0 && pageNum <= pagination.totalPages) {
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => goToPage(pageNum)}
                                            className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium ${pageNum === pagination.page
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                return null;
                            })}
                        </div>

                        <button
                            onClick={() => goToPage(pagination.page + 1)}
                            disabled={!pagination.hasNextPage}
                            className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${pagination.hasNextPage
                                ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                }`}
                        >
                            Next
                            <ArrowRight className="h-4 w-4 ml-1" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrdersPage