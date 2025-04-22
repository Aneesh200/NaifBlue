"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { School, Category, Product } from "@prisma/client";

type SizeInput = {
  size: string;
  ageRange: string;
  stock: number;
};

type ProductFormProps = {
  schools: School[];
  categories: Category[];
  product?: Product & { sizes: any[] };
};

export default function ProductForm({
  schools,
  categories,
  product,
}: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>(
    product?.image_url || [""]
  );
  const [sizes, setSizes] = useState<SizeInput[]>(
    product?.sizes?.map((size: any) => ({
      size: size.size,
      ageRange: size.age_range || "",
      stock: size.stock,
    })) || [{ size: "", ageRange: "", stock: 0 }]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const productData = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: parseFloat(formData.get("price") as string),
        sale_price: formData.get("sale_price")
          ? parseFloat(formData.get("sale_price") as string)
          : null,
        image_url: imageUrls.filter(Boolean),
        stock: parseInt(formData.get("stock") as string, 10),
        is_active: formData.get("is_active") === "on",
        school_id: formData.get("school_id")
          ? (formData.get("school_id") as string)
          : null,
        category_id: formData.get("category_id")
          ? (formData.get("category_id") as string)
          : null,
        sizes: sizes
          .filter((size) => size.size) // Filter out empty sizes
          .map((size) => ({
            size: size.size,
            age_range: size.ageRange || null,
            stock: size.stock,
          })),
      };

      // Handle creating or updating product
      const endpoint = product
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";
      const method = product ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Failed to save product");
      }

      // Redirect to products page
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newImageUrls = [...imageUrls];
    newImageUrls[index] = value;
    setImageUrls(newImageUrls);

    // Add a new empty field if the last field is filled
    if (index === imageUrls.length - 1 && value) {
      setImageUrls([...newImageUrls, ""]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImageUrls = [...imageUrls];
    newImageUrls.splice(index, 1);
    setImageUrls(newImageUrls);
  };

  const handleSizeChange = (index: number, field: keyof SizeInput, value: string | number) => {
    const newSizes = [...sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setSizes(newSizes);

    // Add a new empty field if the last field is filled
    if (index === sizes.length - 1 && field === "size" && value) {
      setSizes([...newSizes, { size: "", ageRange: "", stock: 0 }]);
    }
  };

  const handleRemoveSize = (index: number) => {
    const newSizes = [...sizes];
    newSizes.splice(index, 1);
    setSizes(newSizes);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Product Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={product?.name || ""}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product?.description || ""}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price (₹) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="0.01"
                defaultValue={product?.price || ""}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            <div>
              <label
                htmlFor="sale_price"
                className="block text-sm font-medium text-gray-700"
              >
                Sale Price (₹)
              </label>
              <input
                type="number"
                id="sale_price"
                name="sale_price"
                min="0"
                step="0.01"
                defaultValue={product?.sale_price || ""}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="stock"
              className="block text-sm font-medium text-gray-700"
            >
              Total Stock *
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              required
              min="0"
              defaultValue={product?.stock || "0"}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              defaultChecked={product?.is_active !== false}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label
              htmlFor="is_active"
              className="ml-2 block text-sm text-gray-700"
            >
              Product is active (visible to customers)
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="school_id"
              className="block text-sm font-medium text-gray-700"
            >
              School
            </label>
            <select
              id="school_id"
              name="school_id"
              defaultValue={product?.school_id || ""}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select a school</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={product?.category_id || ""}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            {imageUrls.map((url, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  placeholder="Image URL"
                  value={url}
                  onChange={(e) => handleImageUrlChange(index, e.target.value)}
                  className="flex-grow border border-gray-300 rounded-md shadow-sm p-2"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="ml-2 p-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Sizes
            </label>
            {sizes.map((sizeObj, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Size (e.g. S, M, L)"
                  value={sizeObj.size}
                  onChange={(e) =>
                    handleSizeChange(index, "size", e.target.value)
                  }
                  className="border border-gray-300 rounded-md shadow-sm p-2"
                />
                <input
                  type="text"
                  placeholder="Age Range (e.g. 6-7 years)"
                  value={sizeObj.ageRange}
                  onChange={(e) =>
                    handleSizeChange(index, "ageRange", e.target.value)
                  }
                  className="border border-gray-300 rounded-md shadow-sm p-2"
                />
                <div className="flex">
                  <input
                    type="number"
                    placeholder="Stock"
                    min="0"
                    value={sizeObj.stock}
                    onChange={(e) =>
                      handleSizeChange(
                        index,
                        "stock",
                        parseInt(e.target.value, 10) || 0
                      )
                    }
                    className="border border-gray-300 rounded-md shadow-sm p-2 w-full"
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(index)}
                      className="ml-2 p-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
        >
          {isSubmitting ? "Saving..." : product ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
} 