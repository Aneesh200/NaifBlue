import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { addressId } = await request.json();

    if (!addressId) {
      return NextResponse.json(
        { error: 'Address ID is required' },
        { status: 400 }
      );
    }

    // Update the user's default address using Prisma (bypasses RLS)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        default_address_id: addressId,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to set default address' },
      { status: 500 }
    );
  }
}

