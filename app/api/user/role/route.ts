import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';


export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: new Error('Unauthorized') }, { status: 401 });
    }
    const userId = user.id;
    const userRole = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!userRole) {
      return NextResponse.json({ error: new Error('User not found') }, { status: 404 });
    }
    return NextResponse.json({ role: userRole.role }, { status: 200 });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json({ error: new Error('Internal Server Error') }, { status: 500 });
  }
} 