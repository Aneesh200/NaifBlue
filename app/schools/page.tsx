'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface School {
  id: string;
  name: string;
  address?: string;
  logo_url?: string;
  uniform_requirements?: string;
}


export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);

  useEffect(() => {
    async function fetchSchools() {
      try {
        const response = await fetch('/api/schools');
        if (!response.ok) {
          throw new Error('Failed to fetch schools');
        }
        const data = await response.json();
        setSchools(data);
        setFilteredSchools(data);
      } catch (error) {
        console.error('Error fetching schools:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSchools();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/schools?search=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to search schools');
      }
      const data = await response.json();
      setFilteredSchools(data);
    } catch (error) {
      console.error('Error searching schools:', error);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading schools...</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-light mb-6">Our Affiliated Schools</h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
          We provide high-quality uniforms for schools across India. Browse our affiliated schools and discover the uniform options available for each institution.
        </p>
      </div>

      {/* Search box */}
      {/* <div className="max-w-md mx-auto mb-12">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search schools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div> */}
      
      {filteredSchools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">No schools found matching your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSchools.map((school) => (
            <Card key={school.id} className="overflow-hidden border border-gray-100 hover:border-black transition-colors duration-200">
              <div className="h-48 w-full relative bg-gray-50">
                {school.logo_url ? (
                  <Image
                    src={school.logo_url}
                    alt={school.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
                    <p className="text-gray-400 text-2xl font-light">{school.name.charAt(0)}</p>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="font-light">{school.name}</CardTitle>
                <CardDescription className="text-gray-500">{school.address || 'Location not available'}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-sm line-clamp-3">{school.uniform_requirements || 'Uniform requirements not specified'}</p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-black text-white hover:bg-white hover:text-black border border-black transition-colors duration-200">
                  <Link href={`/products?school=${school.id}`}>
                    View Uniforms
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-20 bg-white border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-light mb-4">School Uniform Partnership Program</h2>
          <p className="text-lg text-gray-500 max-w-3xl mx-auto">
            Is your school looking for a reliable uniform provider? Join our partnership program and enjoy exclusive benefits and customized uniform solutions.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 border border-gray-100">
            <h3 className="text-xl font-light mb-3">Quality Assurance</h3>
            <p className="text-gray-500 text-sm">Our uniforms are made from premium fabrics that are comfortable, durable, and designed to withstand daily wear.</p>
          </div>
          
          <div className="bg-white p-6 border border-gray-100">
            <h3 className="text-xl font-light mb-3">Customization Options</h3>
            <p className="text-gray-500 text-sm">We offer customized uniforms with school logos, colors, and designs that reflect your institution's identity.</p>
          </div>
          
          <div className="bg-white p-6 border border-gray-100">
            <h3 className="text-xl font-light mb-3">Timely Delivery</h3>
            <p className="text-gray-500 text-sm">We ensure timely production and delivery of uniforms to meet your school's schedule and requirements.</p>
          </div>
        </div>
        
        <div className="text-center">
          <Button size="lg" className="bg-black text-white hover:bg-white hover:text-black border border-black transition-colors duration-200">
            <Link href="/contact">Contact Us for Partnership</Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 