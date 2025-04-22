import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  console.log("Auth callback route triggered");
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    try {
      console.log("Auth code found, exchanging for session");
      // Exchange the auth code for a session directly with the admin client
      const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=pkce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          code,
          code_verifier: requestUrl.searchParams.get('code_verifier') || '',
        })
      });
      
      if (!tokenResponse.ok) {
        console.error('Error exchanging code for token:', await tokenResponse.text());
      } else {
        const tokenData = await tokenResponse.json();
        
        // Get user info from the token
        if (tokenData.access_token) {
          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
            }
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log("Retrieved user data from token:", userData.id);
            
            // Create or update profile record in Supabase using admin client
            try {
              // Check if profile already exists
              const { data: existingProfile, error: checkError } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('id', userData.id)
                .maybeSingle();
                
              if (checkError) {
                console.error('Error checking for existing profile:', checkError);
              }
              
              if (!existingProfile) {
                // Create a new profile if none exists
                const { error: profileError } = await supabaseAdmin
                  .from('profiles')
                  .insert({
                    id: userData.id,  // User ID as the central reference
                    email: userData.email || '',
                    name: userData.user_metadata?.full_name || userData.email?.split('@')[0] || '',
                    role: 'user',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                
                if (profileError) {
                  console.error('Error creating profile in callback:', profileError);
                } else {
                  console.log('Profile created in callback for user:', userData.id);
                }
              } else {
                // Update existing profile with latest info from auth
                const { error: updateError } = await supabaseAdmin
                  .from('profiles')
                  .update({
                    email: userData.email || existingProfile.email,
                    name: userData.user_metadata?.full_name || existingProfile.name,
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', userData.id);
                
                if (updateError) {
                  console.error('Error updating profile in callback:', updateError);
                } else {
                  console.log('Profile updated in callback for user:', userData.id);
                }
              }
            } catch (profileError) {
              console.error('Exception when managing profile in callback:', profileError);
            }
          } else {
            console.error('Error getting user data:', await userResponse.text());
          }
        }
      }
    } catch (error) {
      console.error('Error in auth callback:', error);
    }
  }

  // Redirect to appropriate page based on redirect params
  const redirectTo = requestUrl.searchParams.get('redirect') || '/';
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
} 