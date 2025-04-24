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
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        size: selectedSize || "One Size",
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
          <DialogTitle className="text-2xl font-bold">{product.name}</DialogTitle>
          <DialogDescription>
            <span className="text-lg font-semibold text-blue-600">₹{product.price.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No image</span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex flex-col space-y-4">
            <div>
              <h3 className="font-medium text-sm text-gray-500">Description</h3>
              <p className="text-gray-700 line-clamp-3">{product.description}</p>
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-medium text-sm text-gray-500 mb-2">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1 border rounded-md text-sm ${
                        selectedSize === size
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:border-blue-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-2">Quantity</h3>
              <div className="flex items-center">
                <button
                  onClick={decreaseQuantity}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l"
                >
                  -
                </button>
                <div className="w-12 h-8 flex items-center justify-center border-t border-b border-gray-300">
                  {quantity}
                </div>
                <button
                  onClick={increaseQuantity}
                  className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r"
                >
                  +
                </button>
              </div>
            </div>

            <div className="pt-4 mt-auto space-y-2">
              <Button 
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className="w-full"
              >
                {product.in_stock ? "Add to Cart" : "Out of Stock"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={viewFullDetails}
                className="w-full"
              >
                View Full Details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 