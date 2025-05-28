import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
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
      <section className="relative bg-black text-white">
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/hero.png"
            alt="School Uniforms"
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
            className="opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <h1 className="text-4xl font-light tracking-tight sm:text-5xl lg:text-6xl">
              School Uniforms Made Easy
            </h1>
            <p className="mt-4 text-xl font-light text-gray-200">
              Quality uniforms for schools across the country. Find your school
              and get the perfect fit.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="inline-block bg-white text-black border border-transparent py-3 px-8 font-light hover:bg-gray-100 text-center"
              >
                Shop Now
              </Link>
              <Link
                href="/schools"
                className="inline-block bg-transparent border border-white py-3 px-8 font-light text-white hover:bg-white hover:text-black text-center"
              >
                Find Your School
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-light text-black mb-8">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className="group relative bg-gray-50 hover:bg-gray-100 transition-colors duration-300 p-8 text-center"
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
          <h2 className="text-2xl font-light text-black mb-8">Featured Products</h2>
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
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

      {/* Schools Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-light text-black mb-8">Featured Schools</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {schools.map((school) => (
              <Link
                key={school.id}
                href={`/schools/${school.id}`}
                className="group relative bg-white border border-gray-200 hover:border-black transition-colors duration-200 p-4 flex flex-col items-center"
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
                    <span className="text-xl font-light text-gray-500">
                      {school.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-sm font-light text-black text-center">
                  {school.name}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/schools"
              className="inline-flex items-center px-8 py-3 border border-black text-sm font-light text-black hover:bg-black hover:text-white transition-colors duration-200"
            >
              View All Schools
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
            <div className="bg-white border border-gray-200 p-6">
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
            <div className="bg-white border border-gray-200 p-6">
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
            <div className="bg-white border border-gray-200 p-6">
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
            <div className="bg-white border border-gray-200 p-6">
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
