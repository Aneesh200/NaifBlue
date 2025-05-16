'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category_name: string;
  sizes?: string[];
  in_stock: boolean;
}

interface ProductDetailClientProps {
  initialProduct: Product;
}

export default function ProductDetailClient({ initialProduct }: ProductDetailClientProps) {
  const [product] = useState<Product>(initialProduct);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'One Size'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const router = useRouter();

  const handleAddToCart = () => {
    try {
      if (!product.in_stock) return;
      
      const { addItem } = useCartStore.getState();
      
      // Add item to cart with proper null checks
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
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

  return (
    <div className="container mx-auto px-4 py-12">
      <button 
        onClick={() => router.push('/products')}
        className="flex items-center text-gray-500 hover:text-black transition-colors duration-200 mb-8"
      >
        ← Back to Products
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="relative h-96 w-full bg-gray-50 border border-gray-100 overflow-hidden mb-4">
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
                  className={`w-20 h-20 border-2 overflow-hidden flex-shrink-0 transition-colors duration-200 ${
                    index === activeImage ? 'border-black' : 'border-gray-100 hover:border-gray-200'
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
          <h1 className="text-3xl font-light mb-2">{product.name}</h1>
          <p className="text-2xl text-gray-500 font-light mb-6">₹{product.price.toFixed(2)}</p>
          
          <div className="mb-6">
            <h2 className="text-lg font-light mb-2">Description</h2>
            <p className="text-gray-500">{product.description}</p>
          </div>
          
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-light mb-2">Size</h2>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border transition-colors duration-200 ${
                      selectedSize === size 
                        ? 'bg-black text-white border-black' 
                        : 'border-gray-100 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-8">
            <h2 className="text-lg font-light mb-2">Quantity</h2>
            <div className="flex items-center">
              <button
                onClick={decreaseQuantity}
                className="w-10 h-10 flex items-center justify-center border border-gray-100 hover:border-black transition-colors duration-200"
              >
                -
              </button>
              <div className="w-16 h-10 flex items-center justify-center border-t border-b border-gray-100">
                {quantity}
              </div>
              <button
                onClick={increaseQuantity}
                className="w-10 h-10 flex items-center justify-center border border-gray-100 hover:border-black transition-colors duration-200"
              >
                +
              </button>
            </div>
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className={`w-full py-3 px-6 font-light text-white transition-colors duration-200 ${
              product.in_stock 
                ? 'bg-black hover:bg-white hover:text-black border border-black' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100'
            }`}
          >
            {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
          </button>
          
          {!product.in_stock && (
            <p className="text-gray-500 mt-2 text-center text-sm">This product is currently out of stock.</p>
          )}
          
          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-light mb-2">Product Details</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-500">Category:</div>
              <div className="text-gray-500">{product.category_name}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 