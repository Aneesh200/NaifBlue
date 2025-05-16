import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | PgUniform',
  description: 'Learn about our company, mission, and team',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-light mb-6">About PgUniform</h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
          We are dedicated to providing high-quality uniforms, drawing on a rich heritage in the garment industry, that combine comfort, durability, and style.
        </p>
      </div>

      {/* Our Story */}
      <div className="max-w-5xl mx-auto mb-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="bg-gray-50 aspect-square border border-gray-100 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Manufacturing Facility Image Placeholder</p>
          </div>
          <div>
            <h2 className="text-3xl font-light mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-500">
              <p>
                PgUniform builds upon the legacy of Prakash Garments, a respected name in the garment industry since 1973. Initially focused on the readymade segment, Prakash Garments quickly gained recognition for its quality products and unmatched service, cultivating a vast clientele.
              </p>
              <p>
                In 1992, Prakash Garments expanded into manufacturing, a pivotal step fueled by the strong support from its growing customer base. Today, our sprawling 11000 sq ft property houses a dedicated team of over 150 individuals, equipped with modern machinery essential for customization through stitching and printing.
              </p>
              <p>
                PgUniform continues this tradition, committed to providing the same quality, commitment, and dedicated service that has been the hallmark of Prakash Garments. Our reach extends across Maharashtra, Karnataka, Kerala, Tamil Nadu, Telangana, Andhra Pradesh, and Goa, a testament to our enduring dedication to excellence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-gray-50 py-16 px-4 my-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 border border-gray-100">
              <div className="bg-gray-50 p-4 rounded-full inline-flex mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-light mb-3">Quality & Service</h3>
              <p className="text-gray-500 text-sm">Building on decades of experience, we prioritize quality in our garments and are dedicated to providing exceptional service to our clients.</p>
            </div>

            <div className="bg-white p-6 border border-gray-100">
              <div className="bg-gray-50 p-4 rounded-full inline-flex mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-light mb-3">Modern Manufacturing</h3>
              <p className="text-gray-500 text-sm">Our manufacturing facility is equipped with modern machinery, allowing for efficient customization through stitching and printing to meet diverse needs.</p>
            </div>

            <div className="bg-white p-6 border border-gray-100">
              <div className="bg-gray-50 p-4 rounded-full inline-flex mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-light mb-3">Diversified Offerings</h3>
              <p className="text-gray-500 text-sm">We offer a wide range of uniforms and accessories, including those for schools, sports, corporate, and industrial sectors, ensuring we can meet various requirements.</p>
            </div>
          </div>
        </div>
      </div>


      {/* Milestones */}
      <div className="bg-gray-50 py-16 px-4 my-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-light mb-12 text-center">Our Journey</h2>

          <div className="relative border-l-2 border-gray-200 pl-8 ml-4">
            <div className="mb-12 relative">
              <div className="absolute -left-[41px] bg-white p-1">
                <div className="bg-black rounded-full h-6 w-6"></div>
              </div>
              <h3 className="text-xl font-light">1973</h3>
              <p className="text-gray-500 text-sm">Prakash Garments was incepted, establishing itself as a popular name in the readymade garment industry.</p>
            </div>

            <div className="mb-12 relative">
              <div className="absolute -left-[41px] bg-white p-1">
                <div className="bg-black rounded-full h-6 w-6"></div>
              </div>
              <h3 className="text-xl font-light">1992</h3>
              <p className="text-gray-500 text-sm">Prakash Garments forayed into manufacturing, supported by a genuine growing clientele.</p>
            </div>

            <div className="mb-12 relative">
              <div className="absolute -left-[41px] bg-white p-1">
                <div className="bg-black rounded-full h-6 w-6"></div>
              </div>
              <h3 className="text-xl font-light">Present Day</h3>
              <p className="text-gray-500 text-sm">Operating from a sprawling 11000 sq ft property with a dedicated staff of over 150, equipped with modern machinery for stitching and printing. Our reach extends across multiple states in India.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-light mb-6">Experience Quality and Service with PgUniform</h2>
        <p className="text-xl text-gray-500 mb-8">
          Building on a legacy of excellence, we are committed to providing high-quality uniforms and dedicated service.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-black text-white hover:bg-white hover:text-black border border-black transition-colors duration-200">
            <Link href="/contact">Contact Us for Inquiries</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-gray-100 hover:border-black hover:text-black transition-colors duration-200">
            <Link href="/">Visit Our Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}