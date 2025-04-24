import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength (minimum 6 characters - Supabase default requirement)
function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Registration process started');
    const { email, password, fullName } = await request.json();
    
    // Validate required fields
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    
    try {
      // Create a new user with the admin client
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { 
          full_name: fullName,
          role: 'user'
        }
      });
      
      if (createError) {
        console.error('Error creating user in Supabase:', createError);
        
        // Handle specific error types
        if (createError.message.includes('already exists')) {
          return NextResponse.json(
            { error: 'User already exists' },
            { status: 409 }
          );
        }
        
        if (createError.message.includes('expected pattern')) {
          return NextResponse.json(
            { error: 'Invalid input format. Email must be valid and password must meet requirements.' },
            { status: 400 }
          );
        }
        
        return NextResponse.json(
          { error: 'Failed to create user: ' + createError.message },
          { status: 500 }
        );
      }
      
      if (!userData || !userData.user) {
        console.error('User creation succeeded but no user data returned');
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }
      
      console.log('User created in Supabase auth system:', userData.user.id);
      
      // User successfully created in auth.users table
      return NextResponse.json(
        { 
          success: true, 
          message: 'User registered successfully',
          user: {
            id: userData.user.id,
            email: email,
            name: fullName,
            role: 'user'
          }
        },
        { status: 201 }
      );
    } catch (supabaseError: any) {
      console.error('Error with Supabase operations:', supabaseError);
      return NextResponse.json(
        { error: 'Registration failed: ' + (supabaseError.message || 'Unknown error') },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: 'Failed to register user: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
} 