export type OrderStatus =
    | 'pending'
    | 'processing'
    | 'confirmed'
    | 'shipped'
    | 'delivered'
    | 'completed'
    | 'cancelled'
    | 'failed'
    | 'PENDING'
    | 'PROCESSING'
    | 'CONFIRMED'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'FAILED';

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    product_name: string;
    product_image_url: string;
    quantity: number;
    price: number;
    product_variant?: string;
}

export interface ShippingAddress {
    city: string;
    name: string;
    email: string;
    phone: string;
    state: string;
    country: string;
    postal_code: string;
    address_line1: string;
    address_line2?: string;
}

export interface Order {
    id: string;
    orderNumber?: string;
    user_id: string;
    customerName?: string;
    customerEmail?: string;
    created_at: string;
    createdAt?: string; // Alternative field name
    status: OrderStatus;
    total_amount: number;
    totalAmount?: string; // Formatted string for display
    shipping_address: ShippingAddress;
    payment_method: string;
    tracking_number?: string;
    estimated_delivery?: string;
    items?: OrderItem[];
    itemCount?: number;
}

export interface OrdersPagination {
    page: number;
    limit: number;
    totalOrders: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface OrdersResponse {
    orders: Order[];
    pagination: OrdersPagination;
}
