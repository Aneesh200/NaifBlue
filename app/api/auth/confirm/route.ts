// app/api/auth/confirm/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  
  if (token_hash && type) {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verify the token
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });
    
    if (!error) {
      // Get user info after verification
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user already exists in our database
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email as string },
        });
        
        if (!existingUser && user.email) {
          // Create user in database with default "user" role
          await prisma.user.create({
            data: {
              id: user.id,
              email: user.email,
              name: user.user_metadata.full_name || user.email,
              auth_type: 'email',
              // No need to explicitly set role as it defaults to "user" in the schema
            },
          });
        }
      }
    }
  }
  
  // Redirect to dashboard
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}