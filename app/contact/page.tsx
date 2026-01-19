"use client";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Mail, 
  Phone, 
  MapPin
} from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-light mb-6">Contact Us</h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
          Have questions about our products or services? Get in touch with our team and we'll be happy to assist you.
        </p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle className="font-light">Get in Touch</CardTitle>
            <CardDescription className="text-gray-500">
              Our team is here to help with any questions you may have.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start">
              <Mail className="h-6 w-6 mr-4 text-gray-500 mt-1" />
              <div>
                <h3 className="font-light mb-2">Email Us</h3>
                <p className="text-gray-500 text-sm">naifbleu9@gmail.com</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Phone className="h-6 w-6 mr-4 text-gray-500 mt-1" />
              <div>
                <h3 className="font-light mb-2">Call Us</h3>
                <p className="text-gray-500 text-sm">98448 36432</p>
                <p className="text-gray-500 text-sm">98440 57837</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin className="h-6 w-6 mr-4 text-gray-500 mt-1" />
              <div>
                <h3 className="font-light mb-2">Visit Us</h3>
                <p className="text-gray-500 text-sm">
                  46/2 Xavier Layout<br />
                  Bangalore 560047<br />
                  India
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 