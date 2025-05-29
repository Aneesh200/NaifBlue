import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const userRole = user?.app_metadata.role;

    if (!user && !request.nextUrl.pathname.startsWith('/sign-in')) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/sign-in'
        return NextResponse.redirect(url)
    } else if (user && request.nextUrl.pathname.startsWith('/sign-in')) {
        // user exists, but is trying to access the sign-in page
        // redirect them to the dashboard or home page
        const url = request.nextUrl.clone()
        if (userRole === 'admin') {
            url.pathname = '/dashboard/admin'
        } else if (userRole === 'warehouse') {
            url.pathname = '/dashboard/warehouse'
        } else {
            url.pathname = '/'
        }
        return NextResponse.redirect(url)
    } else if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
        const currentPath = request.nextUrl.pathname
        const url = request.nextUrl.clone()

        if (userRole === 'admin' && currentPath !== '/dashboard/admin') {
            url.pathname = '/dashboard/admin'
            return NextResponse.redirect(url)
        } else if (userRole === 'warehouse' && currentPath !== '/dashboard/warehouse') {
            url.pathname = '/dashboard/warehouse'
            return NextResponse.redirect(url)
        } else if (userRole === 'manager' && currentPath !== '/dashboard/manager') {
            url.pathname = '/dashboard/manager'
            return NextResponse.redirect(url)
        } else if (userRole === 'user') {
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