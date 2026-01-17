'use client';

import { Suspense } from 'react';
import AuthForm from '../components/AuthForm';

export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Naif Bleu</h1>
        <Suspense fallback={
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        }>
          <AuthForm />
        </Suspense>
      </div>
    </div>
  );
} 