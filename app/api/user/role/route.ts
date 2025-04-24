// app/api/user/role/route.ts - Fallback endpoint for backward compatibility
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Create client directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // Get the project reference from the URL
    const projectRef = supabaseUrl.match(/(?:db|supabase)\.([a-z0-9-]+)/i)?.[1] || '';
    console.log('Project ref:', projectRef);
    
    // Debug: Log all cookie names to see what's available
    const cookieNames: string[] = [];
    request.cookies.getAll().forEach(cookie => {
      cookieNames.push(cookie.name);
    });
    console.log('Available cookies:', cookieNames);
    
    // Possible cookie name patterns for Supabase
    const possibleCookieNames = [
      `sb-${projectRef}-auth-token`,
      'sb-access-token',
      `${projectRef}-access-token`,
      'access_token',
      'supabase-auth-token',
      'next-auth.session-token',
      'token'
    ];
    
    // Look for any cookie that might contain the access token
    let accessToken: string | undefined;
    
    // Try each possible cookie name
    for (const cookieName of possibleCookieNames) {
      const cookie = request.cookies.get(cookieName);
      if (cookie) {
        console.log('Found auth cookie:', cookieName);
        accessToken = cookie.value;
        break;
      }
    }
    
    // If still not found, try to look for cookies that match common patterns
    if (!accessToken) {
      for (const cookie of request.cookies.getAll()) {
        if (
          cookie.name.includes('auth') || 
          cookie.name.includes('token') || 
          cookie.name.includes('session') ||
          cookie.name.includes(projectRef)
        ) {
          console.log('Found potential auth cookie:', cookie.name);
          accessToken = cookie.value;
          break;
        }
      }
    }
    
    // Special handling for code-verifier cookies
    if (!accessToken || accessToken.includes('verifier')) {
      console.log('No valid token found, checking authorization header...');
      
      // Try to get from Authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        accessToken = authHeader.substring(7);
        console.log('Found token in Authorization header');
      }
    }
    
    if (!accessToken || accessToken.includes('verifier')) {
      console.log('No Supabase auth token found in cookies');
      return NextResponse.json(
        { role: null },
        { status: 401 }
      );
    }
    
    // Extract JWT from the cookie value if it's in JSON format
    let tokenValue = accessToken;
    try {
      // If the token is a JSON object containing the token
      if (tokenValue.startsWith('{') && tokenValue.endsWith('}')) {
        const tokenData = JSON.parse(tokenValue);
        if (tokenData.access_token) {
          tokenValue = tokenData.access_token;
          console.log('Extracted access_token from JSON cookie');
        }
      }
    } catch (e) {
      console.error('Error parsing token JSON:', e);
      // Not JSON, continue with the token as is
    }
    
    // Get user ID directly from the token
    let userId: string | undefined;
    
    try {
      // If it looks like a JWT token
      if (tokenValue.includes('.')) {
        const tokenParts = tokenValue.split('.');
        if (tokenParts.length === 3) {
          try {
            // In Node.js environment, use Buffer for base64 decoding
            const base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(
              Buffer.from(base64, 'base64').toString()
            );
            userId = payload.sub;
            console.log('Extracted user ID from token:', userId);
          } catch (error) {
            console.error('Error decoding JWT:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
    
    // If we couldn't get the user ID from the token, return 401
    if (!userId) {
      return NextResponse.json(
        { role: null },
        { status: 401 }
      );
    }
    
    // Get user role from database
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    
    return NextResponse.json(
      { role: userRecord?.role || null },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { error: 'Failed to get user role' },
      { status: 500 }
    );
  }
} 