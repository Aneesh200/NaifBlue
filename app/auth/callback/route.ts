import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  console.log("Auth callback route triggered");
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    try {
      console.log("Auth code found, exchanging for session");
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // Exchange the code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error("Error exchanging code for session:", exchangeError);
        // Redirect to sign-in page with error
        return NextResponse.redirect(new URL('/sign-in?error=auth_error', requestUrl.origin));
      }
      
      // Get session after exchanging code
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting session after code exchange:", sessionError);
        return NextResponse.redirect(new URL('/sign-in?error=session_error', requestUrl.origin));
      }
      
      if (session?.user) {
        console.log("User authenticated:", session.user.id);
        
        // Check if user record exists in Supabase
        const { data: userRecord, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (userError && userError.code !== 'PGRST116') {
          console.error('Error checking for existing user record:', userError);
        }
        
        // Create user record if it doesn't exist
        if (!userRecord) {
          const { error: createError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
            
          if (createError) {
            console.error('Error creating user record:', createError);
          } else {
            console.log('User record created for:', session.user.id);
          }
        }
      } else {
        console.log("No user session found after auth code exchange");
        return NextResponse.redirect(new URL('/sign-in?error=no_session', requestUrl.origin));
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
      return NextResponse.redirect(new URL('/sign-in?error=unknown', requestUrl.origin));
    }
  } else {
    console.log("No auth code found in callback URL");
    return NextResponse.redirect(new URL('/sign-in?error=no_code', requestUrl.origin));
  }

  // Redirect to the home page
  return NextResponse.redirect(new URL('/', requestUrl.origin));
} 