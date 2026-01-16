import { NextRequest, NextResponse } from 'next/server'
import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time errors
let auth0client: Auth0Client | null = null
let supabaseAdmin: SupabaseClient | null = null

function getAuth0Client() {
    if (!auth0client) {
        auth0client = new Auth0Client()
    }
    return auth0client
}

function getSupabaseAdmin() {
    if (!supabaseAdmin) {
        supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
    }
    return supabaseAdmin
}

/**
 * GET /api/user/profile
 * Returns the current user's Supabase profile
 */
export async function GET(req: NextRequest) {
    try {
        const auth0 = getAuth0Client()
        const session = await auth0.getSession(req)

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const supabase = getSupabaseAdmin()
        const { data: profile, error } = await supabase
            .from('profiles')
            .select(`
        *,
        organization:organizations(id, name, slug, subscription_tier)
      `)
            .eq('auth0_sub', session.user.sub)
            .single()

        if (error) {
            console.error('Error fetching profile:', error)
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ profile })
    } catch (error) {
        console.error('Profile fetch error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
// ... GET handler existing check line numbers

/**
 * PATCH /api/user/profile
 * Updates the current user's Supabase profile securely
 */
export async function PATCH(req: NextRequest) {
    try {
        const auth0 = getAuth0Client()
        const session = await auth0.getSession(req)

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const body = await req.json()
        const { full_name } = body

        if (!full_name || typeof full_name !== 'string' || full_name.includes('@')) {
            return NextResponse.json(
                { error: 'Invalid name provided' },
                { status: 400 }
            )
        }

        const supabase = getSupabaseAdmin()
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: full_name.trim() })
            .eq('auth0_sub', session.user.sub)

        if (error) {
            console.error('Error updating profile:', error)
            return NextResponse.json(
                { error: 'Failed to update profile' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Profile update error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
