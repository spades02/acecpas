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

interface RouteParams {
    params: Promise<{ dealId: string }>
}

/**
 * GET /api/deals/[dealId]
 * Fetch a single deal by ID
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        const { dealId } = await params
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

        const { data: deal, error } = await getSupabase()
            .from('deals')
            .select(`
        *,
        assigned_user:profiles!deals_assigned_to_fkey(id, full_name, email, avatar_url),
        created_user:profiles!deals_created_by_fkey(id, full_name, email),
        files(id, filename, file_type, status, created_at),
        anomalies(id, title, severity, is_resolved),
        open_items(id, question, status, is_resolved)
      `)
            .eq('id', dealId)
            .eq('organization_id', profile.organization_id)
            .single()

        if (error || !deal) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
        }

        return NextResponse.json({ deal })
    } catch (error) {
        console.error('Deal GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * PATCH /api/deals/[dealId]
 * Update a deal
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { dealId } = await params
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

        const body = await req.json()

        // Only allow updating specific fields
        const allowedFields = [
            'name', 'client_name', 'deal_type', 'industry', 'deal_size',
            'status', 'progress', 'target_close_date', 'description', 'assigned_to'
        ]

        const updateData: Record<string, unknown> = {}
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field]
            }
        }

        // Set completed_at when status changes to completed
        if (body.status === 'completed') {
            updateData.completed_at = new Date().toISOString()
        }

        const { data: deal, error } = await getSupabase()
            .from('deals')
            .update(updateData)
            .eq('id', dealId)
            .eq('organization_id', profile.organization_id)
            .select()
            .single()

        if (error) {
            console.error('Error updating deal:', error)
            return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
        }

        return NextResponse.json({ deal })
    } catch (error) {
        console.error('Deal PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * DELETE /api/deals/[dealId]
 * Delete a deal
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const { dealId } = await params
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

        const { error } = await getSupabase()
            .from('deals')
            .delete()
            .eq('id', dealId)
            .eq('organization_id', profile.organization_id)

        if (error) {
            console.error('Error deleting deal:', error)
            return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Deal DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
