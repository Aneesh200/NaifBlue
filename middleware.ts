// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  await supabase.auth.getSession(); // ensures cookie-based auth is loaded

  return res;
}

// export const config = {
//   matcher: ['/protected-route', '/dashboard', '/account/:path*'],
// };
