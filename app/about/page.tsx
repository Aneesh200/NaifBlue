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
        <h1 className="text-4xl font-bold mb-6">About PgUniform</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We are dedicated to providing high-quality school uniforms that combine comfort, durability, and style for students across India.
        </p>
      </div>

      {/* Our Story */}
      <div className="max-w-5xl mx-auto mb-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="bg-gray-200 aspect-square rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Company Image Placeholder</p>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Founded in 2010, PgUniform began with a simple mission: to create comfortable, durable, and stylish school uniforms that students would be proud to wear. What started as a small family business has grown into one of India's leading school uniform providers.
              </p>
              <p>
                Our founder, Rajesh Sharma, noticed that many school uniforms were uncomfortable and didn't last through the school year. Drawing on his extensive background in textile manufacturing, he created a line of uniforms that could withstand the rigors of daily wear while remaining comfortable for growing children.
              </p>
              <p>
                Today, we partner with over 500 schools across India, providing uniforms to more than 200,000 students annually. Our growth is a testament to our commitment to quality, service, and innovation in school uniform production.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values */}
      <div className="bg-gray-50 py-16 px-4 my-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-blue-100 p-4 rounded-full inline-flex mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Quality First</h3>
              <p className="text-gray-600">We use only the finest materials and craftsmanship in our uniforms, ensuring they withstand daily wear and regular washing while maintaining their appearance.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-blue-100 p-4 rounded-full inline-flex mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Affordability</h3>
              <p className="text-gray-600">We believe quality education should be accessible to all, and that includes affordable uniforms. We work to keep our prices competitive without compromising on quality.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="bg-blue-100 p-4 rounded-full inline-flex mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Sustainability</h3>
              <p className="text-gray-600">We're committed to environmentally responsible production methods and are continuously working to reduce our carbon footprint through sustainable practices.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Team */}
      <div className="max-w-6xl mx-auto mb-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Meet Our Leadership Team</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gray-200 h-64 w-full rounded-lg mb-4 flex items-center justify-center">
              <p className="text-gray-500">Team Member Photo</p>
            </div>
            <h3 className="text-xl font-bold">Rajesh Sharma</h3>
            <p className="text-blue-600 mb-2">Founder & CEO</p>
            <p className="text-gray-600">With over 25 years of experience in textile manufacturing, Rajesh leads our company with a vision for quality and innovation.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-200 h-64 w-full rounded-lg mb-4 flex items-center justify-center">
              <p className="text-gray-500">Team Member Photo</p>
            </div>
            <h3 className="text-xl font-bold">Priya Patel</h3>
            <p className="text-blue-600 mb-2">Head of Design</p>
            <p className="text-gray-600">Priya brings 15 years of fashion design experience, creating uniforms that blend comfort, durability, and style.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-200 h-64 w-full rounded-lg mb-4 flex items-center justify-center">
              <p className="text-gray-500">Team Member Photo</p>
            </div>
            <h3 className="text-xl font-bold">Vikram Singh</h3>
            <p className="text-blue-600 mb-2">Operations Director</p>
            <p className="text-gray-600">Vikram ensures our production processes are efficient and sustainable, while maintaining our high quality standards.</p>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-gray-50 py-16 px-4 my-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Journey</h2>
          
          <div className="relative border-l-2 border-blue-600 pl-8 ml-4">
            <div className="mb-12 relative">
              <div className="absolute -left-[41px] bg-white p-1">
                <div className="bg-blue-600 rounded-full h-6 w-6"></div>
              </div>
              <h3 className="text-xl font-bold">2010</h3>
              <p className="text-gray-600">Founded in Delhi with a small team of 5 employees and partnerships with 10 local schools.</p>
            </div>
            
            <div className="mb-12 relative">
              <div className="absolute -left-[41px] bg-white p-1">
                <div className="bg-blue-600 rounded-full h-6 w-6"></div>
              </div>
              <h3 className="text-xl font-bold">2013</h3>
              <p className="text-gray-600">Expanded to Mumbai and Bangalore, increasing our school partnerships to over 50.</p>
            </div>
            
            <div className="mb-12 relative">
              <div className="absolute -left-[41px] bg-white p-1">
                <div className="bg-blue-600 rounded-full h-6 w-6"></div>
              </div>
              <h3 className="text-xl font-bold">2016</h3>
              <p className="text-gray-600">Launched our e-commerce platform, allowing direct ordering for parents and students.</p>
            </div>
            
            <div className="mb-12 relative">
              <div className="absolute -left-[41px] bg-white p-1">
                <div className="bg-blue-600 rounded-full h-6 w-6"></div>
              </div>
              <h3 className="text-xl font-bold">2019</h3>
              <p className="text-gray-600">Reached the milestone of partnering with 300 schools across 10 states in India.</p>
            </div>
            
            <div className="relative">
              <div className="absolute -left-[41px] bg-white p-1">
                <div className="bg-blue-600 rounded-full h-6 w-6"></div>
              </div>
              <h3 className="text-xl font-bold">2023</h3>
              <p className="text-gray-600">Expanded to over 500 school partnerships and introduced our sustainable uniform line made from recycled materials.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Join the PgUniform Family</h2>
        <p className="text-xl text-gray-600 mb-8">
          Whether you're a school administrator looking for quality uniforms, or a parent seeking the best for your child, we're here to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/schools">Partner With Us</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Contact Our Team</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 