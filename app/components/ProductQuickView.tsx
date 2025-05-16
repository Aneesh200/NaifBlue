"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

interface ProductQuickViewProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProductQuickView({ product, open, onOpenChange }: ProductQuickViewProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : "One Size"
  );
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    try {
      if (!product.in_stock) return;

      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        size: selectedSize,
        image: product.images && product.images.length > 0 ? product.images[0] : ""
      });

      toast.success("Added to cart!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
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

  const viewFullDetails = () => {
    router.push(`/products/${product.id}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light">{product.name}</DialogTitle>
          <DialogDescription>
            <span className="text-lg font-light">₹{product.price.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="h-64 md:h-80 bg-gray-50 overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-50">
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <p className="mt-2 text-sm text-gray-500">{product.description}</p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Select Size</h3>
              {product.sizes && product.sizes.length > 0 ? (
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
              ) : (
                <p className="text-sm text-gray-500">One Size</p>
              )}
            </div>

            {/* Quantity Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Quantity</h3>
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

            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={!product.in_stock}
              className={`w-full py-3 px-6 font-light text-white transition-colors duration-200 ${
                product.in_stock 
                  ? 'bg-black hover:bg-white hover:text-black border border-black' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100'
              }`}
            >
              {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
            </Button>

            {!product.in_stock && (
              <p className="text-gray-500 text-center text-sm">This product is currently out of stock.</p>
            )}

            <Button
              variant="outline"
              onClick={viewFullDetails}
              className="w-full border-gray-100 text-gray-500 hover:border-black hover:text-black"
            >
              View Full Details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 