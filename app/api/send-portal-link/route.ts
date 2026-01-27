import { createClient } from '@supabase/supabase-js'
import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendMagicLinkEmail } from '@/lib/email'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const auth0 = new Auth0Client()

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
 * POST /api/send-portal-link
 * Send a magic link email to a client
 */
export async function POST(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { dealId, openItemIds, clientEmail, clientName, expiresInDays = 7 } = body

        if (!dealId || !clientEmail) {
            return NextResponse.json(
                { error: 'Deal ID and client email are required' },
                { status: 400 }
            )
        }

        if (!openItemIds || openItemIds.length === 0) {
            return NextResponse.json(
                { error: 'At least one open item is required' },
                { status: 400 }
            )
        }

        // 1. Get the organization name
        const { data: org } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', organizationId)
            .single()

        // 2. Get the deal name
        const { data: deal } = await supabase
            .from('deals')
            .select('name, client_name')
            .eq('id', dealId)
            .eq('organization_id', organizationId)
            .single()

        if (!deal) {
            return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
        }

        // 3. Get user profile for created_by
        const session = await auth0.getSession()
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('auth0_sub', session!.user.sub)
            .single()

        // 4. Create the magic link
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + expiresInDays)

        const { data: magicLink, error: linkError } = await supabase
            .from('magic_links')
            .insert({
                deal_id: dealId,
                organization_id: organizationId,
                scope: openItemIds,
                expires_at: expiresAt.toISOString(),
                client_email: clientEmail,
                created_by: profile?.id || null
            })
            .select()
            .single()

        if (linkError) {
            console.error('Magic link creation error:', linkError)
            return NextResponse.json(
                { error: 'Failed to create magic link' },
                { status: 500 }
            )
        }

        // 5. Generate the portal URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const portalUrl = `${baseUrl}/portal/${magicLink.token}`

        // 6. Send the email
        try {
            await sendMagicLinkEmail({
                to: clientEmail,
                clientName: clientName || undefined,
                dealName: deal.client_name ? `${deal.client_name} - ${deal.name}` : deal.name,
                firmName: org?.name || 'Your CPA Firm',
                portalUrl,
                expiresAt: expiresAt.toISOString(),
                itemCount: openItemIds.length
            })
        } catch (emailError) {
            console.error('Email send error:', emailError)
            // Link was created but email failed - return partial success
            return NextResponse.json({
                success: true,
                emailSent: false,
                link: {
                    id: magicLink.id,
                    token: magicLink.token,
                    portalUrl,
                    expiresAt: magicLink.expires_at
                },
                error: 'Magic link created but email failed to send. You can copy the link manually.'
            })
        }

        // 7. Update open items status to 'sent'
        await supabase
            .from('open_items')
            .update({ status: 'sent' })
            .in('id', openItemIds)
            .eq('organization_id', organizationId)

        return NextResponse.json({
            success: true,
            emailSent: true,
            link: {
                id: magicLink.id,
                token: magicLink.token,
                portalUrl,
                expiresAt: magicLink.expires_at
            }
        })

    } catch (error) {
        console.error('Send portal link error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
