import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "./components/ProductCard";

export default async function Home() {
  // Get featured products (only active/listed products)
  const featuredProducts = await prisma.product.findMany({
    where: {
      is_active: true,
      in_stock: true,
    },
    take: 8,
    orderBy: {
      created_at: "desc",
    },
    include: {
      school: true,
      category: true,
    },
  });

  // Transform products to match ProductCard interface
  const transformedProducts = featuredProducts.map(product => ({
    ...product,
    school_id: product.school_id || undefined,
    description: product.description || "",
    category_name: product.category?.name || "Uncategorized",
    school_name: product.school?.name || undefined,
    created_at: product.created_at.toISOString(),
    updated_at: product.updated_at.toISOString(),
  }));

  // Get all categories
  const categories = await prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // Get all schools
  const schools = await prisma.school.findMany({
    orderBy: {
      name: "asc",
    },
    take: 6,
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.png"
            alt="Naif Bleu Manufacturing"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            className="opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/60"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl font-light tracking-tight sm:text-6xl lg:text-7xl mb-6">
                Naif Bleu
              </h1>
              <p className="text-2xl font-light text-gray-200 mb-4">
                Quality School Uniforms 
              </p>
              <p className="text-xl font-light text-gray-300 mb-8 max-w-2xl">
                Premium uniforms that combine comfort, durability, and style for students across India.
              </p>
            </div>
            <div className="animate-fade-in-up-delay flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="inline-block bg-white text-black border border-transparent py-4 px-10 font-light hover:bg-gray-100 text-center transition-all duration-300"
              >
                Shop Products
              </Link>
              <Link
                href="/contact"
                className="inline-block bg-transparent border border-white py-4 px-10 font-light text-white hover:bg-white hover:text-black text-center transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-light text-black mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className={`group relative bg-white hover:bg-gray-100 transition-colors duration-300 p-8 text-center border border-gray-200 hover:border-black animate-fade-in-up`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <h3 className="text-lg font-light text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-2">Shop {category.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-light text-black mb-8 text-center">Featured Products</h2>
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {transformedProducts.map((product, index) => (
              <div key={product.id} className={`animate-fade-in-up`} style={{animationDelay: `${index * 0.1}s`}}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-flex items-center px-8 py-3 border border-black text-sm font-light text-black hover:bg-black hover:text-white transition-colors duration-200"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>


      {/* Features/Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-light text-black">
              Why Choose Naif Bleu?
            </h2>
            <p className="mt-2 text-lg font-light text-gray-600">
              We make shopping for school uniforms easy and convenient
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white border border-gray-200 p-6 animate-fade-in-up hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-light text-black">
                Quality Assured
              </h3>
              <p className="mt-2 text-gray-600 font-light">
                All our uniforms are made with premium materials for comfort and
                durability.
              </p>
            </div>
            <div className="bg-white border border-gray-200 p-6 animate-fade-in-up hover:shadow-lg transition-all duration-300" style={{animationDelay: '0.1s'}}>
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-light text-black">Fast Delivery</h3>
              <p className="mt-2 text-gray-600 font-light">
                Quick processing and delivery to ensure your uniforms arrive on
                time.
              </p>
            </div>
            <div className="bg-white border border-gray-200 p-6 animate-fade-in-up hover:shadow-lg transition-all duration-300" style={{animationDelay: '0.2s'}}>
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-light text-black">
                Secure Payments
              </h3>
              <p className="mt-2 text-gray-600 font-light">
                Shop with confidence with our secure payment options.
              </p>
            </div>
            <div className="bg-white border border-gray-200 p-6 animate-fade-in-up hover:shadow-lg transition-all duration-300" style={{animationDelay: '0.3s'}}>
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-light text-black">
                Customer Support
              </h3>
              <p className="mt-2 text-gray-600 font-light">
                Our dedicated team is here to help you with any questions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
