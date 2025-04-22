"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUS } from "@/lib/utils";

type OrderStatusUpdateProps = {
  orderId: string;
  currentStatus: string;
  trackingNumber: string;
  notes: string;
};

export default function OrderStatusUpdate({
  orderId,
  currentStatus,
  trackingNumber,
  notes,
}: OrderStatusUpdateProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(trackingNumber);
  const [orderNotes, setOrderNotes] = useState(notes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      const response = await fetch(`/api/warehouse/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          tracking_number: tracking,
          notes: orderNotes,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update order status");
      }
      
      setSuccess("Order status updated successfully");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Update Order Status</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(ORDER_STATUS).map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label
              htmlFor="tracking"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tracking Number
            </label>
            <input
              type="text"
              id="tracking"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="Enter tracking number"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes
            </label>
            <textarea
              id="notes"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              rows={3}
              placeholder="Add notes about this order"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isSubmitting ? "Updating..." : "Update Order"}
          </button>
        </div>
      </form>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Status Guide:
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            <span className="font-medium">Pending:</span> New order, not yet
            processed
          </li>
          <li>
            <span className="font-medium">Processing:</span> Order is being
            prepared
          </li>
          <li>
            <span className="font-medium">Shipped:</span> Order has been shipped
            (requires tracking number)
          </li>
          <li>
            <span className="font-medium">Delivered:</span> Order has been
            delivered
          </li>
          <li>
            <span className="font-medium">Cancelled:</span> Order has been
            cancelled
          </li>
        </ul>
      </div>
    </div>
  );
} 