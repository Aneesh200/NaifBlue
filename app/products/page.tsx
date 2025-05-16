'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../components/ProductCard';
import ProductQuickView from '../components/ProductQuickView';
import { prisma } from '@/lib/prisma';

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

interface Category {
  id: string;
  name: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const schoolId = searchParams.get('school');
  const categoryParam = searchParams.get('category');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryParam);
  const [sortOption, setSortOption] = useState<string>('default');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [mobileCols, setMobileCols] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);
        
        // Fetch products with optional school filter
        let url = '/api/products';
        if (schoolId) {
          url += `?school=${schoolId}`;
        }
        
        const productsResponse = await fetch(url);
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await productsResponse.json();
        
        // Get school name if filtering by school
        if (schoolId && data.length > 0) {
          const schoolProduct = data.find((p: Product) => p.school_id === schoolId);
          if (schoolProduct) {
            setSchoolName(schoolProduct.school_name);
          }
        }
        
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
            product.description?.toLowerCase().includes(lowerCaseQuery) ||
            product.category_name.toLowerCase().includes(lowerCaseQuery)
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
            // Default sorting (newest first)
            filteredProducts.sort((a, b) => {
              const dateA = new Date(a.created_at || 0).getTime();
              const dateB = new Date(b.created_at || 0).getTime();
              return dateB - dateA;
            });
            break;
        }
        
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [activeCategory, sortOption, searchQuery, schoolId]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    // Show a grid of skeleton cards for loading state
    const skeletons = Array.from({ length: isMobile && mobileCols === 2 ? 6 : 4 });
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 text-lg">Loading products...</p>
        </div>
        <div className={`grid ${mobileCols === 2 ? 'grid-cols-2' : 'grid-cols-1'} sm:grid-cols-2 lg:grid-cols-3 gap-6`}>
          {skeletons.map((_, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 animate-pulse bg-white">
              <div className="aspect-square bg-gray-100 rounded mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="flex gap-2 mt-2">
                <div className="h-8 w-16 bg-gray-100 rounded" />
                <div className="h-8 w-8 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-light mb-2">
        {schoolName ? `${schoolName} Uniforms` : 'Shop Our Products'}
      </h1>
      
      {schoolName && (
        <p className="text-gray-500 mb-8 text-sm">
          Browse our collection of uniforms for {schoolName}
        </p>
      )}
      
      {/* Search and Sort */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-100 focus:outline-none focus:border-black"
          />
        </div>
        <div className="flex w-full md:w-auto items-center gap-2 justify-between md:justify-end">
          <select
            value={sortOption}
            onChange={handleSortChange}
            className="px-4 py-2 border border-black bg-white text-black rounded-md focus:outline-none appearance-none"
          >
            <option value="default">Sort By: Newest</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="name-a-z">Name: A to Z</option>
            <option value="name-z-a">Name: Z to A</option>
          </select>
          {/* Mobile grid toggle, right of sort by */}
          <div className="sm:hidden flex ml-2 bg-gray-50 rounded border border-gray-200 overflow-hidden">
            <button
              className={`p-2 ${mobileCols === 1 ? 'bg-black text-white' : 'text-gray-700'} transition-colors`}
              onClick={() => setMobileCols(1)}
              aria-label="Single column"
            >
              {/* Single column icon */}
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <rect x="4" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill={mobileCols === 1 ? 'white' : 'none'} />
                <rect x="7" y="7" width="6" height="6" rx="1" fill="currentColor" />
              </svg>
            </button>
            <button
              className={`p-2 ${mobileCols === 2 ? 'bg-black text-white' : 'text-gray-700'} transition-colors`}
              onClick={() => setMobileCols(2)}
              aria-label="Two columns"
            >
              {/* Two columns icon */}
              <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                <rect x="4" y="4" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill={mobileCols === 2 ? 'white' : 'none'} />
                <rect x="6" y="7" width="3" height="6" rx="1" fill="currentColor" />
                <rect x="11" y="7" width="3" height="6" rx="1" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Categories Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-6 border border-gray-100">
            <h2 className="text-xl font-light mb-4">Categories</h2>
            {categories.length > 0 ? (
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => handleCategoryClick(category.name)}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors duration-200 ${
                        activeCategory === category.name 
                          ? 'bg-black text-white' 
                          : 'hover:bg-gray-50 text-gray-500'
                      }`}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No categories available</p>
            )}
            
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="w-full mt-4 text-sm text-gray-500 hover:text-black transition-colors duration-200"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
        
        {/* Products Grid */}
        <div className={`w-full md:w-3/4 ${mobileCols === 2 ? 'md:w-3/4' : ''}`}>
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No products found matching your criteria.</p>
            </div>
          ) : (
            <>
              <div className={`grid ${mobileCols === 2 ? 'grid-cols-2' : 'grid-cols-1'} sm:grid-cols-2 lg:grid-cols-3 gap-6`}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={handleQuickView}
                    compact={isMobile && mobileCols === 2}
                  />
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