"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store";

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

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    try {
      // Check if sizes exist and use a default if not
      const defaultSize = product.sizes && product.sizes.length > 0 
        ? product.sizes[0] 
        : "One Size";

      // Add item to cart
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        size: defaultSize,
        image: product.images && product.images.length > 0 ? product.images[0] : ""
      });

      toast.success("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <Link href={`/products/${product.id}`} className="block relative">
        <div className="aspect-square overflow-hidden bg-gray-100">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover object-center transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400">No image</span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="flex flex-col space-y-1.5">
          <h3 className="font-semibold line-clamp-1">
            <Link href={`/products/${product.id}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {product.category_name}
          </p>
          <p className="font-semibold text-lg">₹{product.price.toFixed(2)}</p>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between p-4 pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          asChild
        >
          <Link href={`/products/${product.id}`}>
            Details
          </Link>
        </Button>
        <Button 
          size="sm"
          onClick={handleAddToCart}
          disabled={!product.in_stock}
        >
          {product.in_stock ? 'Add to cart' : 'Out of stock'}
        </Button>
      </CardFooter>
    </Card>
  );
} 