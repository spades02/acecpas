import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { updateSession } from '@/lib/supabase/middleware'

// Lazy initialization to avoid build-time errors
let auth0: Auth0Client | null = null

function getAuth0Client() {
    if (!auth0) {
        auth0 = new Auth0Client({
            routes: {
                login: '/api/auth/login',
                logout: '/api/auth/logout',
                callback: '/api/auth/callback',
            }
        })
    }
    return auth0
}

// Public paths that don't require authentication
const PUBLIC_PATHS = [
    '/login',
    '/signup',
    '/_next',
    '/favicon.ico',
    '/api/auth',
]

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some(path => pathname.startsWith(path))
}

export default async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl
    const auth0Client = getAuth0Client()

    // Handle Auth0 authentication routes
    if (pathname.startsWith('/api/auth/') || pathname.startsWith('/auth/')) {
        return auth0Client.middleware(req)
    }

    // Allow access to public paths
    if (isPublicPath(pathname)) {
        return NextResponse.next()
    }

    // For protected routes, check Auth0 session
    try {
        const session = await auth0Client.getSession(req)

        if (!session) {
            // No session, redirect to login
            const loginUrl = new URL('/login', req.url)
            loginUrl.searchParams.set('returnTo', pathname)
            return NextResponse.redirect(loginUrl)
        }

        // User is authenticated - refresh Supabase session
        const response = await updateSession(req)

        return response
    } catch (error) {
        // Session check failed, redirect to login
        console.error('Auth middleware error:', error)
        const loginUrl = new URL('/login', req.url)
        return NextResponse.redirect(loginUrl)
    }
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
}
