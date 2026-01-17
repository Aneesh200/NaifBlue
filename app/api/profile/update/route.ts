import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { name, phone, default_address_id } = body;

    // Build update object with only provided fields
    const updateData: any = {
      updated_at: new Date()
    };

    if (name !== undefined) updateData.name = name || null;
    if (phone !== undefined) updateData.phone = phone || null;
    if (default_address_id !== undefined) updateData.default_address_id = default_address_id || null;

    // Use Prisma to update user record (bypasses Supabase RLS)
    // This is the same approach used in /api/users/role which works
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        default_address_id: true,
        updated_at: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error: any) {
    console.error('Unexpected error in user update API:', error);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${error.message || JSON.stringify(error)}` },
      { status: 500 }
    );
  }
}

