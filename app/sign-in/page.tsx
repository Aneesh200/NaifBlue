'use client';

import AuthForm from '../components/AuthForm';

export default function SignInPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6">Welcome to Naif Bleu</h1>
        <AuthForm />
      </div>
    </div>
  );
} 