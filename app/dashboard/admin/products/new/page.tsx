"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
    Save,
    Plus,
    Trash2,
    Loader2,
    ShoppingBag,
    ArrowLeft,
    Image as ImageIcon,
    Tag,
    ClipboardList,
    School
} from 'lucide-react'
import Link from 'next/link'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { ProductSize, School as SchoolType, Category } from '@/lib/types'
import Image from 'next/image'
import { useImageUpload } from '@/hooks/useImageUpload'

// Define interfaces based on your schema

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
    const [schools, setSchools] = useState<SchoolType[]>([])


    // Form section tracking for mobile
    const [activeSection, setActiveSection] = useState<string>('basic')

    // Error handling
    const [errors, setErrors] = useState<{
        [key: string]: string
    }>({})

    // New state for pending image files
    const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([]);

    // Image upload function from the custom hook
    const { uploadMultipleImages } = useImageUpload();

    // Category creation modal state
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);

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
                const schoolRes = await fetch('/api/schools')
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

    // Handle creating a new category
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error('Please enter a category name');
            return;
        }

        setIsCreatingCategory(true);

        try {
            const response = await fetch('/api/admin/dashboard/products/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: newCategoryName.trim() }),
            });

            const data = await response.json();

            if (response.status === 409) {
                // Category already exists
                toast.info('Category already exists, selecting it for you');
                setFormData({ ...formData, category_id: data.category.id });
            } else if (!response.ok) {
                throw new Error(data.error || 'Failed to create category');
            } else {
                // Successfully created
                toast.success('Category created successfully!');
                
                // Add the new category to the list
                setCategories([...categories, data.category]);
                
                // Select the newly created category
                setFormData({ ...formData, category_id: data.category.id });
            }

            // Close the modal and reset
            setShowCategoryModal(false);
            setNewCategoryName('');

        } catch (error) {
            console.error('Error creating category:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to create category');
        } finally {
            setIsCreatingCategory(false);
        }
    };

    // Submit the form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error('Please fix the errors in the form')
            return
        }

        setIsSubmitting(true)

        try {
            let finalImageUrls = [...formData.images];

            // Upload any pending image files first
            if (pendingImageFiles.length > 0) {
                toast.info(`Uploading ${pendingImageFiles.length} images...`);

                // Upload the images and get the URLs
                const uploadedUrls = await uploadMultipleImages(pendingImageFiles);

                if (uploadedUrls.length === 0) {
                    throw new Error("Failed to upload images");
                }

                // Add the new URLs to our existing ones
                finalImageUrls = [...finalImageUrls, ...uploadedUrls];
            }

            // Format the data for API with the final image URLs
            const productData = {
                ...formData,
                images: finalImageUrls, // Use the combined URLs
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

            toast.success('Product created successfully!')

            // Redirect to the product page
            router.push(`/dashboard/admin/products`)

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
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Tag className="w-4 h-4 mr-1 text-gray-500" />
                                            Category
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowCategoryModal(true)}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center"
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add New
                                        </button>
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
                                    {schools.map((school: SchoolType) => (
                                        <option key={school.id} value={school.id}>
                                            {school.name}
                                        </option>
                                    ))}
                                </select>
                                {formData.school_id && (
                                    <p className="mt-1 text-xs text-gray-500">Selected school: {schools.find((s: SchoolType) => s.id === formData.school_id)?.name}</p>
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
                        {/* Combined image uploader with preview */}
                        <ImageUploader
                            images={formData.images}
                            onChange={(images) => setFormData({ ...formData, images })}
                            onFilesChange={(files) => setPendingImageFiles(files)}
                            pendingFiles={pendingImageFiles}
                        />
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

            {/* Category Creation Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Create New Category</h3>
                            <button
                                onClick={() => {
                                    setShowCategoryModal(false);
                                    setNewCategoryName('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                                disabled={isCreatingCategory}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700 mb-2">
                                Category Name
                            </label>
                            <input
                                type="text"
                                id="newCategoryName"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !isCreatingCategory) {
                                        e.preventDefault();
                                        handleCreateCategory();
                                    }
                                }}
                                placeholder="e.g. Shirts, Pants, Accessories"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isCreatingCategory}
                                autoFocus
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                This category will be immediately available for selection.
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCategoryModal(false);
                                    setNewCategoryName('');
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50"
                                disabled={isCreatingCategory}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateCategory}
                                disabled={isCreatingCategory || !newCategoryName.trim()}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreatingCategory ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Category
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

export default AddProductPage