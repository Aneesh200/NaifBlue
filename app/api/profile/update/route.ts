import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { name, phone, address, email, id, role } = body;

    // Initialize Supabase with server-side auth
    const supabase = createRouteHandlerClient({ cookies });
    
    let userId;
    
    // If an ID is provided (for guest profiles), use that
    if (id) {
      userId = id;
    } else {
      // Otherwise get the current user's ID
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      userId = session.user.id;
    }

    // Prepare the update object with only the fields that are provided
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role;
    updateData.updated_at = new Date().toISOString();

    // Update the profile with the server-side client (which has proper permissions)
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Server-side profile update error:', error);
      return NextResponse.json(
        { error: `Failed to update profile: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Unexpected error in profile update:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 