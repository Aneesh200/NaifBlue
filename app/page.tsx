import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import ProductCard from "./components/ProductCard";

export default async function Home() {
  // Get featured products
  const featuredProducts = await prisma.product.findMany({
    where: {
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
      <section className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/hero-uniform.jpg"
            alt="School Uniforms"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
          />
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              School Uniforms Made Easy
            </h1>
            <p className="mt-4 text-xl">
              Quality uniforms for schools across the country. Find your school
              and get the perfect fit.
            </p>
            <div className="mt-8 flex">
              <Link
                href="/products"
                className="inline-block bg-blue-600 border border-transparent rounded-md py-3 px-8 font-medium text-white hover:bg-blue-700"
              >
                Shop Now
              </Link>
              <Link
                href="/schools"
                className="inline-block ml-4 bg-white border border-transparent rounded-md py-3 px-8 font-medium text-gray-900 hover:bg-gray-100"
              >
                Find Your School
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group relative bg-gray-100 rounded-lg overflow-hidden hover:opacity-90"
              >
                <div className="aspect-square"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-900">
                    {category.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Schools Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Schools</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {schools.map((school) => (
              <Link
                key={school.id}
                href={`/schools/${school.id}`}
                className="group relative bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-center hover:border-blue-500"
              >
                {school.logo_url ? (
                  <div className="h-16 w-16 mb-2">
                    <Image
                      src={school.logo_url}
                      alt={school.name}
                      width={64}
                      height={64}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 bg-gray-100 rounded-full mb-2 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-500">
                      {school.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-900 text-center">
                  {school.name}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/schools"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              View All Schools
            </Link>
          </div>
        </div>
      </section>

      {/* Features/Benefits Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Why Choose Naif Bleu?
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              We make shopping for school uniforms easy and convenient
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
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
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Quality Assured
              </h3>
              <p className="mt-2 text-gray-600">
                All our uniforms are made with premium materials for comfort and
                durability.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
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
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Fast Delivery</h3>
              <p className="mt-2 text-gray-600">
                Quick processing and delivery to ensure your uniforms arrive on
                time.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
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
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Secure Payments
              </h3>
              <p className="mt-2 text-gray-600">
                Shop with confidence with our secure payment options.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
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
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Easy Returns
              </h3>
              <p className="mt-2 text-gray-600">
                Simple and hassle-free return process if something doesn't fit.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
