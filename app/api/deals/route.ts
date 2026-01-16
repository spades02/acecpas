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
 * GET /api/deals
 * Fetch deals for the authenticated user's organization
 * Query params: status, page, pageSize
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getAuth0().getSession(req)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's organization
        const { data: profile } = await getSupabase()
            .from('profiles')
            .select('organization_id')
            .eq('auth0_sub', session.user.sub)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        // Parse query params
        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status') || 'all'
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '10')
        const offset = (page - 1) * pageSize

        // Build query
        let query = getSupabase()
            .from('deals')
            .select('*, assigned_user:profiles!deals_assigned_to_fkey(full_name, avatar_url)', { count: 'exact' })
            .eq('organization_id', profile.organization_id)
            .order('created_at', { ascending: false })
            .range(offset, offset + pageSize - 1)

        if (status !== 'all') {
            query = query.eq('status', status)
        }

        const { data: deals, error, count } = await query

        if (error) {
            console.error('Error fetching deals:', error)
            return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
        }

        return NextResponse.json({
            deals: deals || [],
            totalCount: count || 0,
            page,
            pageSize
        })
    } catch (error) {
        console.error('Deals GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/deals
 * Create a new deal
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getAuth0().getSession(req)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user's profile
        const { data: profile } = await getSupabase()
            .from('profiles')
            .select('id, organization_id')
            .eq('auth0_sub', session.user.sub)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const body = await req.json()

        // Validate required fields
        if (!body.name || !body.client_name || !body.deal_type) {
            return NextResponse.json(
                { error: 'Missing required fields: name, client_name, deal_type' },
                { status: 400 }
            )
        }

        const { data: deal, error } = await getSupabase()
            .from('deals')
            .insert({
                organization_id: profile.organization_id,
                name: body.name,
                client_name: body.client_name,
                deal_type: body.deal_type,
                industry: body.industry || null,
                deal_size: body.deal_size || null,
                status: body.status || 'draft',
                target_close_date: body.target_close_date || null,
                description: body.description || null,
                assigned_to: body.assigned_to || profile.id,
                created_by: profile.id
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating deal:', error)
            return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
        }

        return NextResponse.json({ deal }, { status: 201 })
    } catch (error) {
        console.error('Deals POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
