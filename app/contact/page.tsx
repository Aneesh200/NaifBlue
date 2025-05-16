"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle 
} from 'lucide-react';

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, subject: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
    
    // Show success message
    setFormSubmitted(true);
    
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false);
    }, 5000);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-light mb-6">Contact Us</h1>
        <p className="text-xl text-gray-500 max-w-3xl mx-auto">
          Have questions about our products or services? Get in touch with our team and we'll be happy to assist you.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Contact Information */}
        <div>
          <Card className="border border-gray-100">
            <CardHeader>
              <CardTitle className="font-light">Get in Touch</CardTitle>
              <CardDescription className="text-gray-500">
                Our team is here to help with any questions you may have.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start">
                <Mail className="h-6 w-6 mr-4 text-gray-500" />
                <div>
                  <h3 className="font-light">Email Us</h3>
                  <p className="text-gray-500 text-sm">info@pguniform.com</p>
                  <p className="text-gray-500 text-sm">support@pguniform.com</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Phone className="h-6 w-6 mr-4 text-gray-500" />
                <div>
                  <h3 className="font-light">Call Us</h3>
                  <p className="text-gray-500 text-sm">+91 98765 43210</p>
                  <p className="text-gray-500 text-sm">+91 12345 67890</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MapPin className="h-6 w-6 mr-4 text-gray-500" />
                <div>
                  <h3 className="font-light">Visit Us</h3>
                  <p className="text-gray-500 text-sm">
                    123 Fashion Street, Textile Market<br />
                    New Delhi, 110001<br />
                    India
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="h-6 w-6 mr-4 text-gray-500" />
                <div>
                  <h3 className="font-light">Business Hours</h3>
                  <p className="text-gray-500 text-sm">Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p className="text-gray-500 text-sm">Saturday: 10:00 AM - 4:00 PM</p>
                  <p className="text-gray-500 text-sm">Sunday: Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-8 border border-gray-100">
            <CardHeader>
              <CardTitle className="font-light">Bulk Orders</CardTitle>
              <CardDescription className="text-gray-500">
                For school administrators and bulk orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-500 text-sm">
                If you're a school administrator looking to place a bulk order or establish a partnership, please contact our dedicated institutional sales team.
              </p>
              <p className="text-gray-500 text-sm">
                <span className="font-light">Email:</span> institutional@pguniform.com<br />
                <span className="font-light">Phone:</span> +91 87654 32109
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Contact Form */}
        <div>
          <Card className="border border-gray-100">
            <CardHeader>
              <CardTitle className="font-light">Send a Message</CardTitle>
              <CardDescription className="text-gray-500">
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formSubmitted ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-16 w-16 text-gray-500 mb-4" />
                  <h3 className="text-2xl font-light text-center mb-2">Thank You!</h3>
                  <p className="text-center text-gray-500 text-sm">
                    Your message has been sent successfully. We'll get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm text-gray-500">Full Name</label>
                      <Input 
                        id="name" 
                        name="name" 
                        placeholder="Your name" 
                        value={formData.name}
                        onChange={handleChange}
                        className="border-gray-100 focus:border-black"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm text-gray-500">Email Address</label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        placeholder="Your email" 
                        value={formData.email}
                        onChange={handleChange}
                        className="border-gray-100 focus:border-black"
                        required 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm text-gray-500">Phone Number</label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      placeholder="Your phone number" 
                      value={formData.phone}
                      onChange={handleChange}
                      className="border-gray-100 focus:border-black"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm text-gray-500">Subject</label>
                    <Select onValueChange={handleSelectChange} value={formData.subject}>
                      <SelectTrigger className="border-gray-100 focus:border-black">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="order">Order Status</SelectItem>
                        <SelectItem value="returns">Returns & Exchanges</SelectItem>
                        <SelectItem value="bulk">Bulk Orders</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm text-gray-500">Message</label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      placeholder="Your message" 
                      value={formData.message}
                      onChange={handleChange}
                      className="border-gray-100 focus:border-black min-h-[150px]"
                      required 
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-black text-white hover:bg-white hover:text-black border border-black transition-colors duration-200"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-16 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Find Us</h2>
        <div className="aspect-video w-full bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Map Embed Placeholder</p>
          {/* Replace with actual map embed code */}
          {/* 
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!...." 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          */}
        </div>
      </div>
    </div>
  );
} 