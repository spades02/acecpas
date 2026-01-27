import { createClient } from '@supabase/supabase-js'
import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { NextRequest, NextResponse } from 'next/server'

// Service role for database operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const auth0 = new Auth0Client()

/**
 * Get the current user's organization ID
 */
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
 * GET /api/magic-links?dealId=xxx
 * List magic links for a deal
 */
export async function GET(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const dealId = request.nextUrl.searchParams.get('dealId')
        if (!dealId) {
            return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 })
        }

        const { data: links, error } = await supabase
            .from('magic_links')
            .select('*')
            .eq('deal_id', dealId)
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching magic links:', error)
            return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            links: links.map(link => ({
                id: link.id,
                token: link.token,
                scope: link.scope,
                expiresAt: link.expires_at,
                isUsed: link.is_used,
                usedAt: link.used_at,
                clientEmail: link.client_email,
                createdAt: link.created_at,
                // Generate the full portal URL
                portalUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/${link.token}`
            }))
        })

    } catch (error) {
        console.error('Magic links list error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/magic-links
 * Create a new magic link for open items
 */
export async function POST(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const session = await auth0.getSession()
        const body = await request.json()
        const { dealId, openItemIds, clientEmail, expiresInDays = 7 } = body

        if (!dealId || !openItemIds?.length) {
            return NextResponse.json(
                { error: 'Deal ID and at least one open item are required' },
                { status: 400 }
            )
        }

        // Get the user's profile ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('auth0_sub', session!.user.sub)
            .single()

        // Calculate expiry date
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + expiresInDays)

        // Create the magic link
        const { data: magicLink, error } = await supabase
            .from('magic_links')
            .insert({
                deal_id: dealId,
                organization_id: organizationId,
                scope: openItemIds,
                expires_at: expiresAt.toISOString(),
                client_email: clientEmail || null,
                created_by: profile?.id || null
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating magic link:', error)
            return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
        }

        const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal/${magicLink.token}`

        return NextResponse.json({
            success: true,
            link: {
                id: magicLink.id,
                token: magicLink.token,
                portalUrl,
                expiresAt: magicLink.expires_at,
                clientEmail: magicLink.client_email
            }
        })

    } catch (error) {
        console.error('Magic link creation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * DELETE /api/magic-links?id=xxx
 * Revoke a magic link
 */
export async function DELETE(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const linkId = request.nextUrl.searchParams.get('id')
        if (!linkId) {
            return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('magic_links')
            .delete()
            .eq('id', linkId)
            .eq('organization_id', organizationId)

        if (error) {
            console.error('Error deleting magic link:', error)
            return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Magic link deletion error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
