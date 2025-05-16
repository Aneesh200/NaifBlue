"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store";
import { useState } from "react";
import { Eye, ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category_name: string;
  school_name?: string;
  school_id?: string;
  sizes?: string[];
  in_stock: boolean;
  created_at?: string;
}

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  compact?: boolean;
}

export default function ProductCard({ product, onQuickView, compact }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : "One Size"
  );

  const handleAddToCart = () => {
    try {
      if (!product.in_stock) return;

      // Add item to cart
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        size: selectedSize,
        image: product.images && product.images.length > 0 ? product.images[0] : ""
      });

      toast.success("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  return (
    <Card className="overflow-hidden border border-gray-100 hover:border-black transition-colors duration-200">
      {/* Image area triggers quick view */}
      <div className="block relative cursor-pointer" onClick={() => onQuickView && onQuickView(product)}>
        <div className="aspect-square overflow-hidden bg-gray-50">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-50">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom part goes to details page */}
      <CardContent className="p-4 cursor-pointer" onClick={() => router.push(`/products/${product.id}`)}>
        <div className="flex flex-col space-y-1.5">
          <h3 className="font-light line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-1">
            {product.category_name}
          </p>
          <p className="font-light text-lg">₹{product.price.toFixed(2)}</p>
          
          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={e => { e.stopPropagation(); setSelectedSize(size); }}
                    className={`px-2 py-1 text-xs border transition-colors duration-200 ${
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
        </div>
      </CardContent>

      <CardFooter className="flex justify-between p-4 pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className={`border-gray-100 text-gray-500 hover:border-black hover:text-black hover:bg-white ${compact ? 'p-2' : ''}`}
          asChild
        >
          <span onClick={() => router.push(`/products/${product.id}`)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {compact ? <Eye className="w-5 h-5" /> : 'Details'}
          </span>
        </Button>
        <Button 
          size="sm"
          className={`bg-black text-white hover:bg-white hover:text-black border border-black ${compact ? 'p-2' : ''}`}
          onClick={e => { e.stopPropagation(); handleAddToCart(); }}
          disabled={!product.in_stock}
        >
          {compact ? <ShoppingCart className="w-5 h-5" /> : (product.in_stock ? 'Add to cart' : 'Out of stock')}
        </Button>
      </CardFooter>
    </Card>
  );
} 