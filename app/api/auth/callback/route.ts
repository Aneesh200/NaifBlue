// app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  console.log("Auth callback route triggered");
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    console.log("Auth code found, exchanging for session");
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
    
    // Get user info
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Error getting user from Supabase:", userError);
    }
    
    if (user) {
      console.log("User found in Supabase:", user.id, user.email);
      // Check if user exists in Prisma DB
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email as string },
        });
        
        console.log("Existing user check:", existingUser ? "Found" : "Not found");
        
        if (!existingUser && user.email) {
          // Determine auth type based on provider
          const authType = user.app_metadata.provider || 'email';
          
          console.log("Creating new user in Prisma DB:", {
            id: user.id,
            email: user.email,
            authType: authType
          });
          
          // Create user in Prisma DB if doesn't exist
          // The role will be "user" by default as defined in the schema
          try {
            const newUser = await prisma.user.create({
              data: {
                id: user.id,
                email: user.email,
                name: user.user_metadata.full_name || user.email,
                auth_type: authType,
                // No need to explicitly set role as it defaults to "user" in the schema
              },
            });
            console.log("Successfully created user in Prisma DB:", newUser.id);
          } catch (createError) {
            console.error("Error creating user in Prisma DB:", createError);
          }
        }
      } catch (dbError) {
        console.error("Error interacting with Prisma DB:", dbError);
      }
    }
  }

  // Redirect to the home page or dashboard
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}