import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  try {
    // createMiddlewareClient properly handles cookies in middleware environment
    const supabase = createMiddlewareClient({ req, res });
    
    // Get the user session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Only use middleware to refresh session
    // (Don't try to create profiles here - that should happen in the auth callback)
    if (session) {
      // We could do a profile check here, but it's better to let
      // the auth callback handle profile creation
      await supabase.auth.getUser();
    }
  } catch (error) {
    console.error('Error in auth middleware:', error);
  }
  
  return res;
}