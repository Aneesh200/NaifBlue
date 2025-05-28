"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
// import Image from 'next/image'
import { Order } from '@/lib/types'
import { renderStatusBadge } from '@/components/admin/OrderStatusCard'

// Product interface
interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string; // Add this field
  images?: string[];  // Keep this field for backward compatibility
  category?: string;
  inventory_count?: number;
  created_at: string;
}

const AdminDashboard = () => {
  const [timeFilter, setTimeFilter] = useState('week')
  const [stats, setStats] = useState({
    totalOrders: { value: "0", change: "0%", positive: true },
    totalRevenue: { value: "₹0", change: "0%", positive: true },
    newCustomers: { value: "0", change: "0%", positive: true },
    inventory: { value: "0 items", change: "0%", positive: true }
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [recentProducts, setRecentProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/admin/dashboard/analytics?timeFilter=${timeFilter}`)
        if (!response.ok) {
          throw new Error('Failed to fetch analytics')
        }
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeFilter]) // Re-fetch when time filter changes

  // Fetch recent orders
  useEffect(() => {
    const fetchRecentOrders = async () => {
      setOrdersLoading(true)
      try {
        const response = await fetch(`/api/admin/dashboard/orders?limit=3`)
        if (!response.ok) {
          throw new Error('Failed to fetch recent orders')
        }
        const data = await response.json()
        setRecentOrders(data.orders || [])
      } catch (error) {
        console.error('Error fetching recent orders:', error)
      } finally {
        setOrdersLoading(false)
      }
    }

    fetchRecentOrders()
  }, []) // Only fetch once on component mount

  // Fetch recent products
  useEffect(() => {
    const fetchRecentProducts = async () => {
      setProductsLoading(true)
      try {
        const response = await fetch('/api/admin/dashboard/products?limit=4')
        if (!response.ok) {
          throw new Error('Failed to fetch recent products')
        }
        const data = await response.json()
        setRecentProducts(data.products || [])
      } catch (error) {
        console.error('Error fetching recent products:', error)
      } finally {
        setProductsLoading(false)
      }
    }

    fetchRecentProducts()
  }, []) // Only fetch once on component mount

  // Format price to currency
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Admin Dashboard</h1>

        {/* Time Period Filter */}
        <div className="mt-4 md:mt-0 flex items-center">
          <label htmlFor="time-filter" className="mr-2 text-sm text-gray-600">
            View data for:
          </label>
          <select
            id="time-filter"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          // Loading skeleton for stats
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-7 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="Total Orders"
              value={stats.totalOrders.value}
              change={stats.totalOrders.change}
              positive={stats.totalOrders.positive}
            />
            <StatCard
              title="Total Revenue"
              value={stats.totalRevenue.value}
              change={stats.totalRevenue.change}
              positive={stats.totalRevenue.positive}
            />
            <StatCard
              title="New Customers"
              value={stats.newCustomers.value}
              change={stats.newCustomers.change}
              positive={stats.newCustomers.positive}
            />
            <StatCard
              title="Inventory"
              value={stats.inventory.value}
              change={stats.inventory.change}
              positive={stats.inventory.positive}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="col-span-2 bg-gray-50 rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-medium mb-4 text-gray-700">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Order ID</th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Customer</th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ordersLoading ? (
                  // Loading skeleton for orders
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : recentOrders.length > 0 ? (
                  // Display actual orders
                  recentOrders.map((order: Order) => (
                    <tr key={order.id}>
                      <td className="py-2 px-4 text-sm">
                        <Link href={`/dashboard/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-800">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2 px-4 text-sm">{order.customerName}</td>
                      <td className="py-2 px-4 text-sm">{renderStatusBadge(order.status)}</td>
                      <td className="py-2 px-4 text-sm">{order.totalAmount}</td>
                    </tr>
                  ))
                ) : (
                  // No orders found
                  <tr>
                    <td colSpan={4} className="py-4 px-4 text-center text-sm text-gray-500">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-right">
            <Link href="/dashboard/admin/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all orders →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-medium mb-4 text-gray-700">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/dashboard/admin/products/new" className="flex items-center p-3 bg-white rounded-md hover:bg-gray-100 transition">
              <div className="p-2 bg-blue-100 rounded-md mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-gray-700">Add New Product</span>
            </Link>
            <Link href="/dashboard/admin/orders/new" className="flex items-center p-3 bg-white rounded-md hover:bg-gray-100 transition">
              <div className="p-2 bg-green-100 rounded-md mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-gray-700">Create Order</span>
            </Link>
            <Link href="/dashboard/admin/settings" className="flex items-center p-3 bg-white rounded-md hover:bg-gray-100 transition">
              <div className="p-2 bg-purple-100 rounded-md mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-gray-700">Store Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-gray-50 rounded-lg p-4 shadow-sm mb-6">
        <h2 className="text-xl font-medium mb-4 text-gray-700">Recent Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productsLoading ? (
            // Loading skeleton for products
            [1, 2, 3, 4].map((placeholder) => (
              <div key={placeholder} className="bg-white p-4 rounded-md shadow-sm animate-pulse">
                <div className="bg-gray-200 h-32 mb-3 rounded-md"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))
          ) : recentProducts.length > 0 ? (
            // Display actual products
            recentProducts.map((product) => (
              <div key={product.id} className="bg-white p-4 rounded-md shadow-sm hover:shadow-md transition-shadow">
                <div className="h-32 mb-3 rounded-md relative overflow-hidden bg-gray-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url} // Use image_url directly, not images array
                      alt={product.name}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <h3 className="font-medium truncate" title={product.name}>
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-2 truncate">
                  {typeof product.category === 'string'
                    ? product.category
                    : 'Uncategorized'}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-blue-600 font-medium">{formatPrice(product.price)}</p>
                  {typeof product.inventory_count === 'number' && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      Stock: {product.inventory_count}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            // No products found
            <div className="col-span-full py-8 text-center text-gray-500">
              No products found
            </div>
          )}
        </div>
        <div className="mt-4 text-right">
          <Link href="/dashboard/admin/products" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View all products →
          </Link>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ title, value, change, positive }: { title: string, value: string, change: string, positive: boolean }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-semibold mt-1">{value}</p>
      <div className={`text-sm mt-2 ${positive ? 'text-green-600' : 'text-red-600'}`}>
        {change}
      </div>
    </div>
  )
}

export default AdminDashboard