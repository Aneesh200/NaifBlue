import { prisma } from '@/lib/prisma';
import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  // Fetch product data on the server
  const product = await prisma.product.findUnique({
    where: {
      id: params.id,
    },
    include: {
      school: true,
      category: true,
      product_sizes: true,
    },
  });

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-light">Product not found</h1>
        <p className="mt-4 text-gray-500">The product you are looking for does not exist.</p>
      </div>
    );
  }

  // Transform the product data
  const transformedProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    images: product.images,
    category_name: product.category?.name || 'Uncategorized',
    sizes: product.product_sizes.map(sizeObj => sizeObj.size),
    in_stock: product.in_stock,
  };

  return <ProductDetailClient initialProduct={transformedProduct} />;
} 