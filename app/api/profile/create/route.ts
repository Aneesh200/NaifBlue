import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    console.log('User creation API called');
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
      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (checkError) {
        console.error('Error checking for existing user:', checkError);
        throw checkError;
      }
      
      // If user exists, return it
      if (existingUser) {
        console.log('User already exists, returning existing user');
        return NextResponse.json({ 
          success: true, 
          data: existingUser,
          message: 'User already exists'
        });
      }
      
      // Create new user record using the user ID as the central reference
      const userData = {
        id,                            // User ID as the central reference
        email,
        name: name || email.split('@')[0],
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert(userData)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating user record:', error);
        throw error;
      }
      
      console.log('User record created successfully:', data.id);
      
      return NextResponse.json({ 
        success: true, 
        data,
        message: 'User record created successfully'
      });
    } catch (error) {
      console.error('User creation error:', error);
      return NextResponse.json(
        { error: `Failed to create user: ${error.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error in user creation API:', error);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error.message || JSON.stringify(error)}` },
      { status: 500 }
    );
  }
} 