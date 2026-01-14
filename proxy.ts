import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Auth0Client } from '@auth0/nextjs-auth0/server';

const auth0 = new Auth0Client({
    routes: {
        login: '/api/auth/login',
        logout: '/api/auth/logout',
        callback: '/api/auth/callback',
    }
});

// Middleware to handle Auth0 routes and protect application routes
export default async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Handle Auth0 authentication routes
    if (pathname.startsWith('/api/auth/')) {
        return auth0.middleware(req);
    }

    // Allow access to login, signup, and static files
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/signup') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico')
    ) {
        return NextResponse.next();
    }

    // Check for session cookie for protected routes
    const session = req.cookies.get('__session');

    // If no session, redirect to login
    if (!session) {
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
};
