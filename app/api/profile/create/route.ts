import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    console.log('Profile creation API called');
    // Get the request body
    const body = await request.json();
    const { id, email, name } = body;

    console.log('Received data:', { id, email, name });

    if (!id || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: id and email' },
        { status: 400 }
      );
    }

    try {
      // Check if profile already exists
      const { data: existingProfile, error: checkError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking for existing profile:', checkError);
        throw checkError;
      }
      
      // If profile exists, return it
      if (existingProfile) {
        console.log('Profile already exists, returning existing profile');
        return NextResponse.json({ 
          success: true, 
          data: existingProfile,
          message: 'Profile already exists'
        });
      }
      
      // Create new profile using the user ID as the central reference
      const profileData = {
        id,                            // User ID as the central reference
        email,
        name: name || email.split('@')[0],
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }
      
      console.log('Profile created successfully:', data.id);
      
      return NextResponse.json({ 
        success: true, 
        data,
        message: 'Profile created successfully'
      });
    } catch (error) {
      console.error('Profile creation error:', error);
      return NextResponse.json(
        { error: `Failed to create profile: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in profile creation API:', error);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error.message || JSON.stringify(error)}` },
      { status: 500 }
    );
  }
} 