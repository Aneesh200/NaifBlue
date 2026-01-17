import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.')
        // Return response without auth check if env vars are missing
        return supabaseResponse
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: DO NOT REMOVE auth.getUser()

    let user = null
    let authCheckFailed = false
    
    try {
        const {
            data: { user: fetchedUser },
            error,
        } = await supabase.auth.getUser()

        if (error) {
            console.error('Error fetching user in middleware:', error.message)
            // If there's an auth error, treat as no user
            user = null
        } else {
            user = fetchedUser
        }
    } catch (error) {
        // Handle fetch failures (network errors, etc.)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error('Failed to fetch user in middleware:', errorMessage)
        
        // Mark that auth check failed - we'll skip auth redirects
        authCheckFailed = true
        user = null
        
        // If Supabase is unreachable, allow public routes to work
        // This prevents the entire app from breaking if Supabase is temporarily unavailable
        const publicPaths = ['/sign-in', '/api/auth', '/api/auth/callback']
        const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))
        
        if (isPublicPath) {
            // Allow public paths to proceed when auth check fails
            return supabaseResponse
        }
        
        // For protected paths, we'll still try to check cookies manually
        // but won't redirect if we can't reach Supabase
    }

    const userRole = user?.app_metadata.role;

    // Skip auth redirects if the auth check failed (Supabase unreachable)
    if (authCheckFailed) {
        // Allow the request to proceed - don't block it
        return supabaseResponse
    }

    // Define public routes that don't require authentication
    const publicRoutes = [
        '/',
        '/sign-in',
        '/products',
        '/about',
        '/contact',
        '/schools',
        '/faq',
        '/privacy',
        '/terms',
        '/shipping-returns',
        '/size-guide',
        '/checkout/cart', // Cart should be publicly accessible
        '/api/auth',
        '/api/products',
        '/api/categories',
        '/api/schools',
        '/api/cart',
    ]

    // Define protected routes that require authentication
    const protectedRoutes = [
        '/dashboard',
        '/profile',
        '/orders',
        '/checkout', // Main checkout requires auth (except /checkout/cart which is public)
        '/checkout/shipping',
        '/checkout/success',
    ]

    const currentPath = request.nextUrl.pathname

    // Check if the current path is a public route (check specific paths first)
    const isPublicRoute = publicRoutes.some(route => 
        currentPath === route || currentPath.startsWith(route + '/')
    )

    // Only check protected routes if it's not already a public route
    // This ensures /checkout/cart (public) takes precedence over /checkout (protected)
    const isProtectedRoute = !isPublicRoute && protectedRoutes.some(route => 
        currentPath.startsWith(route)
    )

    // Redirect unauthenticated users trying to access protected routes
    if (!user && isProtectedRoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/sign-in'
        // Save the original URL they were trying to access
        url.searchParams.set('redirectTo', currentPath)
        return NextResponse.redirect(url)
    } else if (user && request.nextUrl.pathname.startsWith('/sign-in')) {
        // user exists, but is trying to access the sign-in page
        // Check if there's a redirect URL from where they came
        const url = request.nextUrl.clone()
        const redirectTo = request.nextUrl.searchParams.get('redirectTo')
        
        if (redirectTo && redirectTo.startsWith('/')) {
            // Redirect to the original page they were trying to access
            url.pathname = redirectTo
            url.searchParams.delete('redirectTo')
        } else {
            // Default redirect based on role
            if (userRole === 'admin') {
                url.pathname = '/dashboard/admin'
            } else if (userRole === 'warehouse') {
                url.pathname = '/dashboard/warehouse'
            } else {
                url.pathname = '/'
            }
        }
        return NextResponse.redirect(url)
    } else if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
        const url = request.nextUrl.clone()

        // Allow admin users to access all /dashboard/admin/* routes
        if (userRole === 'admin') {
            // Only redirect if they're trying to access a different dashboard (warehouse/manager) or just /dashboard
            if (currentPath.startsWith('/dashboard/warehouse') || 
                currentPath.startsWith('/dashboard/manager') ||
                currentPath === '/dashboard') {
                url.pathname = '/dashboard/admin'
                return NextResponse.redirect(url)
            }
            // Allow all /dashboard/admin/* paths
        } else if (userRole === 'warehouse') {
            // Only redirect if they're trying to access a different dashboard (admin/manager) or just /dashboard
            if (currentPath.startsWith('/dashboard/admin') || 
                currentPath.startsWith('/dashboard/manager') ||
                currentPath === '/dashboard') {
                url.pathname = '/dashboard/warehouse'
                return NextResponse.redirect(url)
            }
            // Allow all /dashboard/warehouse/* paths
        } else if (userRole === 'manager') {
            // Only redirect if they're trying to access a different dashboard (admin/warehouse) or just /dashboard
            if (currentPath.startsWith('/dashboard/admin') || 
                currentPath.startsWith('/dashboard/warehouse') ||
                currentPath === '/dashboard') {
                url.pathname = '/dashboard/manager'
                return NextResponse.redirect(url)
            }
            // Allow all /dashboard/manager/* paths
        } else if (userRole === 'user') {
            // Regular users shouldn't access any dashboard
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }


    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}