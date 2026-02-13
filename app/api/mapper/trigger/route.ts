import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const auth0 = new Auth0Client()

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

async function getOrganizationId(): Promise<string | null> {
    try {
        const session = await auth0.getSession()
        if (!session?.user) return null

        const { data } = await supabase
            .from('profiles')
            .select('organization_id')
            .eq('auth0_sub', session.user.sub)
            .single()

        return (data as { organization_id: string } | null)?.organization_id || null
    } catch {
        return null
    }
}

/**
 * POST /api/mapper/trigger
 * Triggers the AI mapping process for a deal's GL accounts.
 * Proxies to the FastAPI backend.
 */
export async function POST(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { dealId, reprocess = false } = body

        if (!dealId) {
            return NextResponse.json(
                { error: 'Deal ID is required' },
                { status: 400 }
            )
        }

        // Proxy to the FastAPI backend
        const backendRes = await fetch(`${BACKEND_URL}/api/v1/mapper/run`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                deal_id: dealId,
                organization_id: organizationId,
                reprocess
            })
        })

        const data = await backendRes.json()

        if (!backendRes.ok) {
            return NextResponse.json(
                { error: data.detail || 'Failed to trigger mapper' },
                { status: backendRes.status }
            )
        }

        return NextResponse.json({
            success: true,
            message: data.message || 'Mapper triggered successfully'
        })

    } catch (error) {
        console.error('Mapper trigger error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * GET /api/mapper/trigger?dealId=xxx
 * Get the mapping status for a deal.
 */
export async function GET(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const dealId = request.nextUrl.searchParams.get('dealId')
        if (!dealId) {
            return NextResponse.json(
                { error: 'Deal ID is required' },
                { status: 400 }
            )
        }

        // Proxy to the FastAPI backend
        const backendRes = await fetch(
            `${BACKEND_URL}/api/v1/mapper/status?deal_id=${dealId}`,
            { method: 'GET' }
        )

        const data = await backendRes.json()

        if (!backendRes.ok) {
            return NextResponse.json(
                { error: data.detail || 'Failed to get mapper status' },
                { status: backendRes.status }
            )
        }

        return NextResponse.json({
            success: true,
            ...data
        })

    } catch (error) {
        console.error('Mapper status error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
