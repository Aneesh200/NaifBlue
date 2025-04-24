'use client';

import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import ProductQuickView from '../components/ProductQuickView';

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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Fetch all products
        const productsResponse = await fetch('/api/products');
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await productsResponse.json();
        
        // Get unique categories
        const uniqueCategories = Array.from(new Set(data.map((product: Product) => product.category_name)));
        setCategories(uniqueCategories as string[]);
        
        // Apply filters
        let filteredProducts = data as Product[];
        
        // Apply category filter if selected
        if (activeCategory) {
          filteredProducts = filteredProducts.filter(product => 
            product.category_name === activeCategory
          );
        }
        
        // Apply search filter (client-side)
        if (searchQuery) {
          const lowerCaseQuery = searchQuery.toLowerCase();
          filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(lowerCaseQuery) || 
            product.description?.toLowerCase().includes(lowerCaseQuery)
          );
        }
        
        // Apply sorting
        switch (sortOption) {
          case 'price-low-high':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price-high-low':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
          case 'name-a-z':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'name-z-a':
            filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
          default:
            // Default sorting or newest first
            break;
        }
        
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [activeCategory, sortOption, searchQuery]);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category === activeCategory ? null : category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading products...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Shop Our Products</h1>
      
      {/* Search and Sort */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </div>
        
        <div>
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="default">Sort By: Default</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="name-a-z">Name: A to Z</option>
            <option value="name-z-a">Name: Z to A</option>
          </select>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Categories Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Categories</h2>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category}>
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className={`w-full text-left px-3 py-2 rounded ${
                      activeCategory === category 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
            
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="w-full mt-4 text-sm text-blue-600 hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="w-full md:w-3/4">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="relative group">
                    <ProductCard product={product} />
                    <button
                      onClick={() => handleQuickView(product)}
                      className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-50 transition-all duration-300"
                    >
                      <span className="bg-white opacity-100 px-4 py-2 rounded-md shadow-md text-sm font-medium">
                        Quick View
                      </span>
                    </button>
                  </div>
                ))}
              </div>
              
              {quickViewProduct && (
                <ProductQuickView 
                  product={quickViewProduct} 
                  open={quickViewOpen} 
                  onOpenChange={setQuickViewOpen} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 