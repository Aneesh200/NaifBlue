import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    console.log('Registration process started');
    const { email, password, fullName } = await request.json();
    
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    try {
      // Check if user already exists using the admin client
      const { data: existingUsers, error: checkError } = await supabaseAdmin.auth.admin.listUsers({
        filters: {
          email: email
        }
      });
      
      if (checkError) {
        console.error('Error checking for existing user:', checkError);
        return NextResponse.json(
          { error: 'Failed to check if user exists' },
          { status: 500 }
        );
      }
      
      if (existingUsers && existingUsers.users.length > 0) {
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 409 }
        );
      }
      
      // Create a new user with the admin client
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm the email
        user_metadata: { 
          full_name: fullName,
          // Store any other user metadata here
        }
      });
      
      if (error) {
        console.error('Error creating user in Supabase:', error);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }
      
      console.log('User created in Supabase auth system:', data.user.id);
      
      // Create a profile for the user with the user ID as reference
      if (data.user) {
        try {
          console.log('Creating profile in Supabase');
          const { error: profileError, data: profileData } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: data.user.id,         // This is the key user ID reference
              name: fullName,
              email: email,
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (profileError) {
            console.error('Error creating profile in Supabase:', profileError);
            return NextResponse.json(
              { error: 'Failed to create user profile' },
              { status: 500 }
            );
          } else {
            console.log('Profile created in Supabase:', profileData?.id);
          }
          
          return NextResponse.json(
            { 
              success: true, 
              message: 'User registered successfully',
              user: {
                id: data.user.id,
                email: email,
                name: fullName,
                role: 'user'
              }
            },
            { status: 201 }
          );
        } catch (profileError) {
          console.error('Exception creating profile in Supabase:', profileError);
          return NextResponse.json(
            { error: 'Failed to complete user registration' },
            { status: 500 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    } catch (supabaseError) {
      console.error('Error with Supabase operations:', supabaseError);
      throw supabaseError;
    }
  } catch (error) {
    console.error('Error during registration:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
} 