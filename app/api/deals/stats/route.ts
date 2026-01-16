import { NextRequest, NextResponse } from 'next/server'
import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization
let auth0: Auth0Client | null = null
let supabase: SupabaseClient | null = null

function getAuth0() {
    if (!auth0) auth0 = new Auth0Client()
    return auth0
}

function getSupabase() {
    if (!supabase) {
        supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
    }
    return supabase
}

/**
 * GET /api/deals/stats
 * Get deal statistics for dashboard
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getAuth0().getSession(req)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await getSupabase()
            .from('profiles')
            .select('organization_id')
            .eq('auth0_sub', session.user.sub)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        // Get counts by status
        const { data: deals, error } = await getSupabase()
            .from('deals')
            .select('status')
            .eq('organization_id', profile.organization_id)

        if (error) {
            console.error('Error fetching deal stats:', error)
            return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
        }

        const stats = {
            total: deals?.length || 0,
            draft: deals?.filter(d => d.status === 'draft').length || 0,
            active: deals?.filter(d => d.status === 'active').length || 0,
            completed: deals?.filter(d => d.status === 'completed').length || 0,
            archived: deals?.filter(d => d.status === 'archived').length || 0
        }

        return NextResponse.json(stats)
    } catch (error) {
        console.error('Deal stats error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
