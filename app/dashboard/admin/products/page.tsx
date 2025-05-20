"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
    Search,
    Filter,
    Plus,
    Pencil,
    Trash2,
    ArrowLeft,
    ArrowRight,
    Tag,
    Loader2,
    X,
    ChevronDown,
    Eye
} from 'lucide-react'

// Product interface
interface Product {
    id: string;
    name: string;
    price: number;
    description?: string;
    image_url?: string;
    images?: string[];
    category?: string | { id: string; name: string; created_at?: string; updated_at?: string };
    inventory_count?: number;
    created_at: string;
}

// Category interface
interface Category {
    id: string;
    name: string;
    productCount: number;
}

const ProductsPage = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Get query params with defaults
    const currentPage = parseInt(searchParams.get('page') || '1')
    const currentCategory = searchParams.get('category') || ''
    const currentSearch = searchParams.get('search') || ''

    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({
        page: currentPage,
        limit: 12,
        totalProducts: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    })

    const [searchQuery, setSearchQuery] = useState(currentSearch)
    const [categoryFilter, setCategoryFilter] = useState(currentCategory)
    const [categories, setCategories] = useState<Category[]>([])
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

    // Fetch products on component mount and when query params change
    useEffect(() => {
        fetchProducts(currentPage, currentCategory, currentSearch)
        fetchCategories()
    }, [currentPage, currentCategory, currentSearch])

    const fetchProducts = async (page: number, category: string, search: string) => {
        setLoading(true)
        try {
            // Build query string
            const queryParams = new URLSearchParams()
            queryParams.set('page', page.toString())
            queryParams.set('limit', '12')

            if (category) queryParams.set('category', category)
            if (search) queryParams.set('search', search)

            const response = await fetch(`/api/admin/dashboard/products?${queryParams.toString()}`)

            if (!response.ok) {
                throw new Error('Failed to fetch products')
            }

            const data = await response.json()

            setProducts(data.products || [])
            setPagination({
                page,
                limit: 12,
                totalProducts: data.total || 0,
                totalPages: data.totalPages || 1,
                hasNextPage: page < (data.totalPages || 1),
                hasPrevPage: page > 1
            })
        } catch (error) {
            console.error('Error fetching products:', error)
            toast.error('Failed to load products')
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/admin/dashboard/products/categories');

            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }

            const data = await response.json();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const applyFilters = () => {
        const queryParams = new URLSearchParams()
        queryParams.set('page', '1') // Reset to page 1

        if (categoryFilter) queryParams.set('category', categoryFilter)
        if (searchQuery) queryParams.set('search', searchQuery)

        router.push(`/dashboard/admin/products?${queryParams.toString()}`)
    }

    const resetFilters = () => {
        setCategoryFilter('')
        setSearchQuery('')
        router.push('/dashboard/admin/products')
    }

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            applyFilters()
        }
    }

    const goToPage = (page: number) => {
        const queryParams = new URLSearchParams(searchParams.toString())
        queryParams.set('page', page.toString())
        router.push(`/dashboard/admin/products?${queryParams.toString()}`)
    }

    const deleteProduct = async (productId: string) => {
        setDeleteLoading(productId)
        try {
            const response = await fetch(`/api/admin/dashboard/products/${productId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete product')
            }

            // Remove the product from the local state
            setProducts(products.filter(product => product.id !== productId))
            toast.success('Product deleted successfully')
        } catch (error) {
            console.error('Error deleting product:', error)
            toast.error('Failed to delete product')
        } finally {
            setDeleteLoading(null)
            setShowDeleteModal(null)
        }
    }

    // Format price to currency
    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price)
    }

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Products</h1>

                <div className="mt-4 md:mt-0">
                    <Link
                        href="/dashboard/admin/products/new"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm font-medium"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add New Product
                    </Link>
                </div>
            </div>

            {/* Search and Filter Controls */}
            <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
                        <div className="relative">
                            <input
                                type="text"
                                id="search"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Search by name or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearchKeyDown}
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                    </div>

                    <div className="w-full md:w-1/4">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <div className="relative">
                            <select
                                id="category"
                                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md appearance-none focus:ring-blue-500 focus:border-blue-500"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name} ({category.productCount})
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between">
                    <button
                        onClick={resetFilters}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 flex items-center"
                    >
                        <X className="w-3 h-3 mr-1" />
                        Reset Filters
                    </button>

                    <button
                        onClick={applyFilters}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md flex items-center text-sm font-medium"
                    >
                        <Filter className="w-4 h-4 mr-1.5" />
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm animate-pulse">
                            <div className="bg-gray-200 w-full h-48"></div>
                            <div className="p-4 space-y-3">
                                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow transition-shadow duration-200">
                            {/* Image Container - Fixed aspect ratio */}
                            <div className="relative w-full pt-[75%] bg-gray-100">
                                {product.image_url ? (
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        fill
                                        className="object-cover absolute top-0 left-0"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                ) : product.images && product.images.length > 0 ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover absolute top-0 left-0"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-4 space-y-2">
                                <h3 className="font-medium text-gray-800 truncate" title={product.name}>
                                    {product.name}
                                </h3>

                                {/* Category Tag */}
                                {product.category && (
                                    <div className="flex items-center">
                                        <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full truncate max-w-full">
                                            <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                                            <span className="truncate">
                                                {typeof product.category === 'string'
                                                    ? product.category
                                                    : product.category.name}
                                            </span>
                                        </span>
                                    </div>
                                )}

                                {/* Price and Stock */}
                                <div className="flex items-center justify-between pt-1">
                                    <span className="font-semibold text-blue-600">{formatPrice(product.price)}</span>
                                    {typeof product.inventory_count === 'number' && (
                                        <span className={`text-xs px-2 py-1 rounded-full ${product.inventory_count > 10
                                                ? 'bg-green-50 text-green-700'
                                                : product.inventory_count > 0
                                                    ? 'bg-yellow-50 text-yellow-700'
                                                    : 'bg-red-50 text-red-700'
                                            }`}>
                                            Stock: {product.inventory_count}
                                        </span>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="border-t pt-3 mt-2 flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        <Link
                                            href={`/dashboard/admin/products/${product.id}`}
                                            className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>

                                        <Link
                                            href={`/dashboard/admin/products/${product.id}/edit`}
                                            className="p-1.5 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                                            title="Edit Product"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Link>

                                        <button
                                            onClick={() => setShowDeleteModal(product.id)}
                                            disabled={deleteLoading === product.id}
                                            className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 disabled:opacity-50 transition-colors"
                                            title="Delete Product"
                                        >
                                            {deleteLoading === product.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatDate(product.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-16 text-center">
                    <Tag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-700">No products found</h3>
                    <p className="text-gray-500 mt-1">Try changing your search criteria or add a new product.</p>
                    <Link
                        href="/dashboard/admin/products/new"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="mr-1.5 h-4 w-4" />
                        Add New Product
                    </Link>
                </div>
            )}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                    <div className="text-sm text-gray-500">
                        Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.totalProducts)} of{' '}
                        {pagination.totalProducts} products
                    </div>

                    <div className="flex space-x-1">
                        <button
                            onClick={() => goToPage(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNum: number;

                            if (pagination.totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (pagination.page <= 3) {
                                pageNum = i + 1;
                            } else if (pagination.page >= pagination.totalPages - 2) {
                                pageNum = pagination.totalPages - 4 + i;
                            } else {
                                pageNum = pagination.page - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => goToPage(pageNum)}
                                    className={`px-3 py-1 border rounded ${pageNum === pagination.page
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => goToPage(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-3 py-1 border border-gray-300 rounded bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Product</h3>
                        <p className="text-gray-500 mb-5">
                            Are you sure you want to delete this product? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteProduct(showDeleteModal)}
                                disabled={deleteLoading !== null}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                            >
                                {deleteLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-1.5" />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductsPage