'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category_name: string;
  sizes: string[];
  in_stock: boolean;
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function fetchProduct() {
      try {
        // Fetch product from API endpoint
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        
        setProduct(data);
        if (data.sizes && data.sizes.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [params.id]);

  const handleAddToCart = () => {
    try {
      if (!product || !selectedSize) return;
      
      const { addItem } = useCartStore.getState();
      
      // Add item to cart
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || '',
        quantity: quantity,
        size: selectedSize
      });
      
      // Show success message
      toast.success('Product added to cart!');
      router.push('/checkout/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <p className="mt-4">The product you are looking for does not exist.</p>
        <button 
          onClick={() => router.push('/products')}
          className="mt-6 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <button 
        onClick={() => router.push('/products')}
        className="flex items-center text-blue-600 hover:underline mb-8"
      >
        ← Back to Products
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="relative h-96 w-full bg-gray-100 rounded-lg overflow-hidden mb-4">
            {product.images && product.images.length > 0 && (
              <div className="relative w-full h-full">
                <img
                  src={product.images[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`w-20 h-20 border-2 rounded overflow-hidden flex-shrink-0 ${
                    index === activeImage ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-2xl text-blue-600 font-semibold mb-6">₹{product.price.toFixed(2)}</p>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Size</h2>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md ${
                      selectedSize === size 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Quantity</h2>
            <div className="flex items-center">
              <button
                onClick={decreaseQuantity}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l"
              >
                -
              </button>
              <div className="w-16 h-10 flex items-center justify-center border-t border-b border-gray-300">
                {quantity}
              </div>
              <button
                onClick={increaseQuantity}
                className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r"
              >
                +
              </button>
            </div>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className={`w-full py-3 px-6 rounded-lg font-medium text-white ${
              product.in_stock 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          
          {!product.in_stock && (
            <p className="text-red-500 mt-2 text-center">This product is currently out of stock.</p>
          )}
          
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold mb-2">Product Details</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-600">Category:</div>
              <div>{product.category_name}</div>
              {/* Add more product details as needed */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 