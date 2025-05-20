"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    Save,
    X,
    Plus,
    Trash2,
    Upload,
    Loader2,
    ShoppingBag,
    ArrowLeft,
    Image as ImageIcon,
    Tag,
    ClipboardList,
    School
} from 'lucide-react'
import Link from 'next/link'

// Define interfaces based on your schema
interface Category {
    id: string
    name: string
}

interface School {
    id: string
    name: string
}

interface ProductSize {
    size: string
    age_range?: string
    stock: number
}

const AddProductPage = () => {
    const router = useRouter()

    // Product form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        in_stock: true,
        inventory_count: 100,
        category_id: '',
        school_id: '',
        images: [] as string[]
    })

    // Product sizes state - handle as a separate array
    const [productSizes, setProductSizes] = useState<ProductSize[]>([
        { size: '', age_range: '', stock: 0 }
    ])

    // Loading and options states
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [schools, setSchools] = useState<School[]>([])

    // Image handling
    const [imageUrls, setImageUrls] = useState<string>('')
    const [isUploading, setIsUploading] = useState(false)

    // Form section tracking for mobile
    const [activeSection, setActiveSection] = useState<string>('basic')

    // Error handling
    const [errors, setErrors] = useState<{
        [key: string]: string
    }>({})

    // Fetch categories and schools on component mount
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                // Fetch categories
                const categoryRes = await fetch('/api/admin/dashboard/products/categories')
                if (categoryRes.ok) {
                    const categoryData = await categoryRes.json()
                    setCategories(categoryData.categories || [])
                }

                // Fetch schools
                const schoolRes = await fetch('/api/admin/dashboard/schools')
                if (schoolRes.ok) {
                    const schoolData = await schoolRes.json()
                    setSchools(schoolData.schools || [])
                }
            } catch (error) {
                console.error('Error fetching options:', error)
                toast.error('Failed to load categories or schools')
            }
        }

        fetchOptions()
    }, [])

    // Handle form field changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target

        const updatedValue = type === 'number'
            ? parseFloat(value)
            : type === 'checkbox'
                ? (e.target as HTMLInputElement).checked
                : value

        setFormData({ ...formData, [name]: updatedValue })

        // Clear error when field is edited
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' })
        }
    }

    // Handle product size changes
    const handleSizeChange = (index: number, field: keyof ProductSize, value: string | number) => {
        const updatedSizes = [...productSizes]

        if (field === 'stock') {
            updatedSizes[index][field] = Number(value)
        } else {
            updatedSizes[index][field] = value as string
        }

        setProductSizes(updatedSizes)
    }

    // Add a new size row
    const addSize = () => {
        setProductSizes([...productSizes, { size: '', age_range: '', stock: 0 }])
    }

    // Remove a size row
    const removeSize = (index: number) => {
        if (productSizes.length > 1) {
            const updatedSizes = [...productSizes]
            updatedSizes.splice(index, 1)
            setProductSizes(updatedSizes)
        }
    }

    // Add image URL
    const addImageUrl = () => {
        if (imageUrls && !formData.images.includes(imageUrls)) {
            setFormData({
                ...formData,
                images: [...formData.images, imageUrls]
            })
            setImageUrls('')
        }
    }

    // Remove image URL
    const removeImage = (index: number) => {
        const updatedImages = [...formData.images]
        updatedImages.splice(index, 1)
        setFormData({ ...formData, images: updatedImages })
    }

    // Handle image upload (stub - you'll need to implement actual upload)
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setIsUploading(true)

        try {
            // This is a placeholder - you need to implement actual image upload
            // Example: upload to cloud storage and get URLs back

            // Mock upload response for demo
            const uploadedUrls = await Promise.all(
                Array.from(files).map(async (file) => {
                    // You would upload the file here and get a URL back
                    // For now, we'll create an object URL as a placeholder
                    return URL.createObjectURL(file)
                })
            )

            setFormData({
                ...formData,
                images: [...formData.images, ...uploadedUrls]
            })
            toast.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded`)

        } catch (error) {
            console.error('Error uploading images:', error)
            toast.error('Failed to upload images')
        } finally {
            setIsUploading(false)
            // Clear the input
            e.target.value = ''
        }
    }

    // Validate form
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required'
        }

        if (!formData.price || isNaN(parseFloat(formData.price as string)) || parseFloat(formData.price as string) <= 0) {
            newErrors.price = 'Valid price is required'
        }

        if (formData.inventory_count < 0) {
            newErrors.inventory_count = 'Inventory count cannot be negative'
        }

        // Validate sizes - at least one valid size is required
        let hasSizeError = true
        for (const size of productSizes) {
            if (size.size.trim() && size.stock >= 0) {
                hasSizeError = false
                break
            }
        }

        if (hasSizeError) {
            newErrors.sizes = 'At least one valid product size is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    // Submit the form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error('Please fix the errors in the form')
            return
        }

        setIsSubmitting(true)

        try {
            // Format the data for API
            const productData = {
                ...formData,
                price: parseFloat(formData.price as string),
                productSizes: productSizes.filter(size => size.size.trim() !== '')
            }

            const response = await fetch('/api/admin/dashboard/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to create product')
            }

            const result = await response.json()
            toast.success('Product created successfully!')

            // Redirect to the product page
            router.push(`/dashboard/admin/products/${result.id}`)

        } catch (error) {
            console.error('Error creating product:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to create product')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            {/* Header with improved styling */}
            <div className="flex items-center justify-between mb-8 border-b pb-5">
                <div className="flex items-center">
                    <Link href="/dashboard/admin/products" className="mr-4 text-gray-500 hover:text-gray-700 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">Add New Product</h1>
                        <p className="text-sm text-gray-500 mt-1">Create a new product in your inventory</p>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-md flex items-center text-sm font-medium disabled:opacity-50 transition-colors shadow-sm hover:shadow"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Product
                        </>
                    )}
                </button>
            </div>

            {/* Mobile section tabs */}
            <div className="md:hidden mb-6 flex rounded-lg overflow-hidden border border-gray-200">
                <button
                    onClick={() => setActiveSection('basic')}
                    className={`flex-1 py-2 px-3 text-sm font-medium ${activeSection === 'basic' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                >
                    Basic
                </button>
                <button
                    onClick={() => setActiveSection('sizes')}
                    className={`flex-1 py-2 px-3 text-sm font-medium ${activeSection === 'sizes' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                >
                    Sizes
                </button>
                <button
                    onClick={() => setActiveSection('images')}
                    className={`flex-1 py-2 px-3 text-sm font-medium ${activeSection === 'images' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600'}`}
                >
                    Images
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden ${activeSection !== 'basic' && 'md:block hidden'}`}>
                    <div className="bg-gradient-to-r from-blue-50 to-white p-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <ShoppingBag className="w-5 h-5 text-blue-600 mr-2" />
                            <h2 className="text-lg font-medium text-gray-800">Basic Information</h2>
                        </div>
                    </div>

                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 border rounded-md ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                                    placeholder="Enter product name"
                                />
                                {errors.name && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center">
                                        <span className="inline-block w-4 h-4 mr-1 rounded-full bg-red-100 border border-red-300 text-red-600 text-xs flex items-center justify-center">!</span>
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (₹) *
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-500">₹</span>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className={`w-full pl-8 pr-4 py-2.5 border rounded-md ${errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.price && (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center">
                                        <span className="inline-block w-4 h-4 mr-1 rounded-full bg-red-100 border border-red-300 text-red-600 text-xs flex items-center justify-center">!</span>
                                        {errors.price}
                                    </p>
                                )}
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    placeholder="Describe your product in detail (features, materials, care instructions, etc.)"
                                ></textarea>
                            </div>

                            <div>
                                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <Tag className="w-4 h-4 mr-1 text-gray-500" />
                                        Category
                                    </div>
                                </label>
                                <select
                                    id="category_id"
                                    name="category_id"
                                    value={formData.category_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors appearance-none"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236B7280'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E")`,
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundSize: '1.25rem',
                                        backgroundRepeat: 'no-repeat',
                                        paddingRight: '2.5rem'
                                    }}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {formData.category_id && (
                                    <p className="mt-1 text-xs text-gray-500">Selected category: {categories.find(c => c.id === formData.category_id)?.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="school_id" className="block text-sm font-medium text-gray-700 mb-1">
                                    <div className="flex items-center">
                                        <School className="w-4 h-4 mr-1 text-gray-500" />
                                        School
                                    </div>
                                </label>
                                <select
                                    id="school_id"
                                    name="school_id"
                                    value={formData.school_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-colors appearance-none"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%236B7280'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E")`,
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundSize: '1.25rem',
                                        backgroundRepeat: 'no-repeat',
                                        paddingRight: '2.5rem'
                                    }}
                                >
                                    <option value="">Select a school</option>
                                    {schools.map((school) => (
                                        <option key={school.id} value={school.id}>
                                            {school.name}
                                        </option>
                                    ))}
                                </select>
                                {formData.school_id && (
                                    <p className="mt-1 text-xs text-gray-500">Selected school: {schools.find(s => s.id === formData.school_id)?.name}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="inventory_count" className="block text-sm font-medium text-gray-700 mb-1">
                                    Total Inventory Count
                                </label>
                                <input
                                    type="number"
                                    id="inventory_count"
                                    name="inventory_count"
                                    value={formData.inventory_count}
                                    onChange={handleChange}
                                    min="0"
                                    className={`w-full px-4 py-2.5 border rounded-md ${errors.inventory_count ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                                />
                                {errors.inventory_count ? (
                                    <p className="mt-1.5 text-sm text-red-600 flex items-center">
                                        <span className="inline-block w-4 h-4 mr-1 rounded-full bg-red-100 border border-red-300 text-red-600 text-xs flex items-center justify-center">!</span>
                                        {errors.inventory_count}
                                    </p>
                                ) : (
                                    <p className="mt-1 text-xs text-gray-500">Total number of items in stock across all sizes</p>
                                )}
                            </div>

                            <div className="flex items-center">
                                <label className="inline-flex items-center cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            id="in_stock"
                                            name="in_stock"
                                            checked={formData.in_stock}
                                            onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">Product is in stock</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Sizes */}
                <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden ${activeSection !== 'sizes' && 'md:block hidden'}`}>
                    <div className="bg-gradient-to-r from-purple-50 to-white p-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <ClipboardList className="w-5 h-5 text-purple-600 mr-2" />
                            <h2 className="text-lg font-medium text-gray-800">Product Sizes</h2>
                        </div>
                    </div>

                    <div className="p-5">
                        {errors.sizes && (
                            <div className="mb-6 text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100 flex items-start">
                                <span className="inline-block w-5 h-5 mr-2 rounded-full bg-red-100 border border-red-300 text-red-600 text-xs flex items-center justify-center mt-0.5">!</span>
                                <div>
                                    <p className="font-medium">Size Error</p>
                                    <p>{errors.sizes}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-3 text-sm font-medium text-gray-600">
                                <div className="col-span-3 md:col-span-3">Size</div>
                                <div className="col-span-5 md:col-span-5">Age Range</div>
                                <div className="col-span-3 md:col-span-3">Stock</div>
                                <div className="col-span-1 md:col-span-1"></div>
                            </div>

                            {productSizes.map((size, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-12 gap-3 items-center p-3 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
                                >
                                    <div className="col-span-3 md:col-span-3">
                                        <input
                                            type="text"
                                            value={size.size}
                                            onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                                            placeholder="e.g. S, M, L"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>

                                    <div className="col-span-5 md:col-span-5">
                                        <input
                                            type="text"
                                            value={size.age_range || ''}
                                            onChange={(e) => handleSizeChange(index, 'age_range', e.target.value)}
                                            placeholder="e.g. 6-7 years"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>

                                    <div className="col-span-3 md:col-span-3">
                                        <input
                                            type="number"
                                            value={size.stock}
                                            onChange={(e) => handleSizeChange(index, 'stock', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-1 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => removeSize(index)}
                                            disabled={productSizes.length === 1}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            title={productSizes.length === 1 ? "At least one size is required" : "Remove this size"}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addSize}
                                className="mt-3 inline-flex items-center justify-center w-full px-4 py-2.5 border-2 border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-600 hover:text-blue-600 hover:border-blue-300 bg-white hover:bg-blue-50 transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-1.5" />
                                Add Another Size
                            </button>
                        </div>
                    </div>
                </div>

                {/* Product Images */}
                <div className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden ${activeSection !== 'images' && 'md:block hidden'}`}>
                    <div className="bg-gradient-to-r from-green-50 to-white p-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <ImageIcon className="w-5 h-5 text-green-600 mr-2" />
                            <h2 className="text-lg font-medium text-gray-800">Product Images</h2>
                        </div>
                    </div>

                    <div className="p-5">
                        {/* Image uploads */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
                            <label
                                className="flex flex-col items-center justify-center px-4 py-8 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                            >
                                <div className="flex flex-col items-center">
                                    <div className="p-3 rounded-full bg-blue-50 text-blue-500 mb-3 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <span className="text-sm text-gray-700 font-medium">Drag and drop files here</span>
                                    <span className="text-xs text-gray-500 mt-1">or click to browse</span>
                                    <span className="text-xs text-gray-400 mt-3">Maximum 5MB per file • JPG, PNG, WEBP</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                    />
                                </div>
                            </label>
                            {isUploading && (
                                <div className="mt-3 bg-blue-50 text-blue-700 p-3 rounded-md flex items-center">
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    <span className="text-sm">Uploading images...</span>
                                </div>
                            )}
                        </div>

                        {/* Add image URL */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Or Add Image URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={imageUrls}
                                    onChange={(e) => setImageUrls(e.target.value)}
                                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                    placeholder="https://example.com/image.jpg"
                                />
                                <button
                                    type="button"
                                    onClick={addImageUrl}
                                    disabled={!imageUrls}
                                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="mt-1.5 text-xs text-gray-500">Enter a valid URL for an image hosted elsewhere</p>
                        </div>

                        {/* Image preview */}
                        {formData.images.length > 0 ? (
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-gray-700">Product Images ({formData.images.length})</h3>
                                    <span className="text-xs text-gray-500">Drag to reorder (first image will be featured)</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {formData.images.map((image, index) => (
                                        <div key={index} className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-white">
                                            <div className="aspect-square bg-gray-100">
                                                <img
                                                    src={image}
                                                    alt={`Product image ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-500 hover:text-white"
                                                title="Remove image"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            {index === 0 && (
                                                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-md font-medium opacity-80">Featured</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 border border-gray-200 rounded-lg bg-gray-50 p-6 text-center">
                                <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500">No images added yet</p>
                                <p className="text-gray-400 text-sm mt-1">Images help your product sell better</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit buttons at bottom */}
                <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row-reverse gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center justify-center text-sm font-medium disabled:opacity-50 shadow-sm hover:shadow transition-all"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating Product...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Create Product
                            </>
                        )}
                    </button>

                    <Link
                        href="/dashboard/admin/products"
                        className="w-full sm:w-auto border border-gray-300 bg-white text-gray-700 px-6 py-3 rounded-md flex items-center justify-center text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    )
}

export default AddProductPage