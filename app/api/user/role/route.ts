import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { Database } from '@/types/supabase';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Get the user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ role: null }, { status: 401 });
    }

    // Use the admin client to bypass RLS permissions
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return NextResponse.json({ role: null }, { status: 500 });
    }

    return NextResponse.json({ role: data?.role || null });
  } catch (error) {
    console.error('Error in user role endpoint:', error);
    return NextResponse.json({ role: null }, { status: 500 });
  }
} 