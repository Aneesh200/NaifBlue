export default function ShippingReturnsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-light mb-8">Shipping & Returns Policy</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300">
          <h2 className="text-xl font-light mb-4 text-gray-900">Shipping Policy</h2>
          <div className="space-y-4 text-gray-500">
            <p>Orders are typically processed within 1-2 business days. We offer two shipping options:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Standard Shipping (3-5 business days)</li>
              <li>Express Shipping (1-2 business days)</li>
            </ul>
            <p>Shipping costs are calculated at checkout based on your location and the weight of your order.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300">
          <h2 className="text-xl font-light mb-4 text-gray-900">Returns Policy</h2>
          <div className="space-y-4 text-gray-500">
            <p>We do not accept returns or exchanges. All sales are final.</p>
            <p>Please ensure you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Select the correct size using our size guide</li>
              <li>Review the product details and images carefully</li>
              <li>Check the color and style before placing your order</li>
            </ul>
            <p>If you receive a damaged item, please contact our customer service within 24 hours of delivery with photos of the damage. We will review your case and provide appropriate assistance.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 p-6 hover:border-black transition-colors duration-300 md:col-span-2">
          <h2 className="text-xl font-light mb-4 text-gray-900">Order Tracking</h2>
          <div className="space-y-4 text-gray-500">
            <p>Once your order ships, you will receive a tracking number via email. You can also track your order status by logging into your account.</p>
            <p>If you have any questions about your order, please contact our customer service team.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 