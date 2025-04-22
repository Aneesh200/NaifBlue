// lib/roleCheck.ts
import { redirect } from 'next/navigation';
import prisma from './prisma';
import { createServerSupabaseClient } from './supabaseServerClient';

export async function checkUserRole(requiredRoles: string[] = []) {
  const supabase = createServerSupabaseClient();
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/auth');
  }
  
  // If no specific roles are required, just being logged in is enough
  if (requiredRoles.length === 0) {
    return true;
  }
  
  // Get user data from Prisma including role
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });
  
  // Check if user has required role
  if (!user || !requiredRoles.includes(user.role)) {
    redirect('/unauthorized');
  }
  
  return true;
}