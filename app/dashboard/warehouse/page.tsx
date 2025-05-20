"use client";

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import {
  PackageIcon,
  TruckIcon,
  CheckCircleIcon,
  SearchIcon,
  RefreshCcwIcon,
  CalendarIcon,
  MapPinIcon,
  UserIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ListIcon
} from "lucide-react";

// Order type definition
interface Order {
  id: string;
  customerName: string;
  orderDate: string;
  items: { name: string; quantity: number }[];
  status: "pending" | "processing" | "delivered";
  address: string;
}

const WareHouseDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 9;

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Update filtered orders when orders or search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      setFilteredOrders(
        orders.filter(
          (order) =>
            order.id.toLowerCase().includes(lowercaseQuery) ||
            order.customerName.toLowerCase().includes(lowercaseQuery) ||
            order.address.toLowerCase().includes(lowercaseQuery)
        )
      );
    }
    // Reset to first page when search query changes
    setCurrentPage(1);
  }, [orders, searchQuery]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/dashboard/orders/pending');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Failed to load pending orders");
    } finally {
      setIsLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string) => {
    try {
      const response = await fetch('/api/admin/dashboard/orders/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          newStatus: 'processing'
        }),
      });

      if (!response.ok) throw new Error('Failed to update order');

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: 'processing' }
          : order
      ));

      toast.success(`Order #${orderId} marked for delivery`);
    } catch (error) {
      console.error("Failed to update order:", error);
      toast.error("Failed to update order status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 flex items-center gap-1">
            <PackageIcon size={14} />
            <span>Pending</span>
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 flex items-center gap-1">
            <TruckIcon size={14} />
            <span>Processing</span>
          </Badge>
        );
      case 'delivered':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200 flex items-center gap-1">
            <CheckCircleIcon size={14} />
            <span>Delivered</span>
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusCounts = () => {
    const counts = { pending: 0, processing: 0, delivered: 0 };
    orders.forEach(order => {
      if (counts[order.status as keyof typeof counts] !== undefined) {
        counts[order.status as keyof typeof counts]++;
      }
    });
    return counts;
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  // Format date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-yellow-800">Pending Orders</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <PackageIcon className="text-yellow-600" />
              {statusCounts.pending}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800/70">Awaiting preparation</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-800">Processing Orders</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <TruckIcon className="text-blue-600" />
              {statusCounts.processing}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800/70">Out for delivery</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-green-800">Completed Orders</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <CheckCircleIcon className="text-green-600" />
              {statusCounts.delivered}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-800/70">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="shadow-md">
        <CardHeader className="border-b bg-slate-50/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <PackageIcon className="text-slate-700" />
                Warehouse Dashboard
              </CardTitle>
              <CardDescription>
                Manage orders and prepare them for delivery
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="pl-8 w-[250px] bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchOrders}
                className="bg-white"
                title="Refresh orders"
              >
                <RefreshCcwIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin">
                  <RefreshCcwIcon className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500">Loading orders...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <PackageIcon className="h-12 w-12 text-slate-300" />
                <p>No pending orders found</p>
                {searchQuery && (
                  <p className="text-sm text-slate-400">Try adjusting your search criteria</p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedOrders.map((order) => (
                  <Card
                    key={order.id}
                    className="overflow-hidden border-l-4 hover:-translate-y-1 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
                    style={{
                      borderLeftColor: order.status === 'pending' ? '#EAB308' :
                        order.status === 'processing' ? '#3B82F6' : '#22C55E'
                    }}
                  >
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-white p-4 pb-3">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex flex-col">
                          <div className="font-medium text-xs uppercase text-slate-500">Order ID</div>
                          <div className="font-bold text-lg text-slate-800">{order.id}</div>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-500 mt-2 bg-white py-1 px-2 rounded-full w-fit">
                        <CalendarIcon size={14} />
                        <span>{formatDate(order.orderDate)}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0">
                      <div className="bg-gradient-to-r from-slate-50 to-white p-4 border-y">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700 mb-2">
                          <div className="bg-blue-100 p-1.5 rounded-full">
                            <UserIcon size={14} className="text-blue-700" />
                          </div>
                          <span className="text-blue-800">{order.customerName}</span>
                        </div>
                      </div>

                      <div className="p-4 space-y-4 bg-white">
                        <div>
                          <div className="flex items-center gap-1.5 font-medium mb-2">
                            <div className="bg-amber-100 p-1.5 rounded-full">
                              <MapPinIcon size={14} className="text-amber-700" />
                            </div>
                            <span className="text-amber-800">Delivery Address</span>
                          </div>
                          <div className="ml-8 text-sm text-slate-600 break-words">
                            {order.address}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 font-medium mb-2">
                            <div className="bg-purple-100 p-1.5 rounded-full">
                              <ListIcon size={14} className="text-purple-700" />
                            </div>
                            <span className="text-purple-800">Order Items</span>
                          </div>
                          <div className="ml-8 space-y-1.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="bg-purple-50 text-purple-800 border border-purple-200 text-xs py-0.5 px-2 rounded-full font-medium">
                                  {item.quantity}×
                                </div>
                                <span className="text-sm">{item.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="p-4 flex justify-end bg-gradient-to-r from-slate-50 to-white">
                      {order.status === 'pending' ? (
                        <Button
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none transition-all group"
                          onClick={() => updateOrderStatus(order.id)}
                        >
                          <TruckIcon size={16} className="mr-1.5 group-hover:animate-bounce" />
                          Send for Delivery
                        </Button>
                      ) : (
                        <Button variant="outline" disabled className="opacity-50">
                          <TruckIcon size={16} className="mr-1.5" />
                          In Process
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                  <div className="text-sm text-slate-500">
                    Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 p-0"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 p-0 ${page === currentPage ? "bg-slate-800 hover:bg-slate-700" : "bg-white"
                          }`}
                      >
                        {page}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 p-0"
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t p-4 bg-slate-50/50">
          <p className="text-sm text-slate-500">
            {filteredOrders.length} order{filteredOrders.length !== 1 && 's'} {searchQuery && 'found'}
          </p>
          <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleTimeString()}</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WareHouseDashboard;