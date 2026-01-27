import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use service role for portal access (no user session required)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/portal/[token]
 * Validates a magic link token and returns the associated open items
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params

        // 1. Find and validate the magic link
        const { data: magicLink, error: linkError } = await supabase
            .from('magic_links')
            .select('*')
            .eq('token', token)
            .single()

        if (linkError || !magicLink) {
            return NextResponse.json(
                { error: 'Invalid or expired link' },
                { status: 404 }
            )
        }

        // 2. Check if link is expired
        if (new Date(magicLink.expires_at) < new Date()) {
            return NextResponse.json(
                { error: 'This link has expired. Please contact your CPA firm for a new link.' },
                { status: 410 }
            )
        }

        // 3. Check if link was already used (optional - depends on business logic)
        // For now, we allow multiple uses until expiry

        // 4. Get the deal info for context
        const { data: deal } = await supabase
            .from('deals')
            .select('id, name, client_name')
            .eq('id', magicLink.deal_id)
            .single()

        // 5. Fetch the open items in the scope
        const { data: openItems, error: itemsError } = await supabase
            .from('open_items')
            .select(`
        id,
        question,
        context,
        priority,
        status,
        client_response,
        responded_at,
        is_resolved,
        anomaly:anomalies(
          id,
          title,
          description,
          detected_value,
          anomaly_type
        )
      `)
            .in('id', magicLink.scope)
            .order('priority', { ascending: false })

        if (itemsError) {
            console.error('Error fetching open items:', itemsError)
            return NextResponse.json(
                { error: 'Failed to load items' },
                { status: 500 }
            )
        }

        // 6. Get organization info for branding
        const { data: org } = await supabase
            .from('organizations')
            .select('id, name')
            .eq('id', magicLink.organization_id)
            .single()

        return NextResponse.json({
            success: true,
            portal: {
                token,
                expiresAt: magicLink.expires_at,
                clientEmail: magicLink.client_email,
                deal: deal ? {
                    id: deal.id,
                    name: deal.name,
                    clientName: deal.client_name
                } : null,
                organization: org ? {
                    id: org.id,
                    name: org.name
                } : null,
                items: openItems?.map(item => ({
                    id: item.id,
                    question: item.question,
                    context: item.context,
                    priority: item.priority,
                    status: item.status,
                    clientResponse: item.client_response,
                    respondedAt: item.responded_at,
                    isResolved: item.is_resolved,
                    anomaly: item.anomaly
                })) || []
            }
        })

    } catch (error) {
        console.error('Portal API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/portal/[token]
 * Submit responses to open items via magic link
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        const body = await request.json()
        const { itemId, response } = body

        if (!itemId || !response?.trim()) {
            return NextResponse.json(
                { error: 'Item ID and response are required' },
                { status: 400 }
            )
        }

        // 1. Validate the magic link
        const { data: magicLink, error: linkError } = await supabase
            .from('magic_links')
            .select('*')
            .eq('token', token)
            .single()

        if (linkError || !magicLink) {
            return NextResponse.json(
                { error: 'Invalid or expired link' },
                { status: 404 }
            )
        }

        // 2. Check expiry
        if (new Date(magicLink.expires_at) < new Date()) {
            return NextResponse.json(
                { error: 'This link has expired' },
                { status: 410 }
            )
        }

        // 3. Verify the item is in the scope
        if (!magicLink.scope.includes(itemId)) {
            return NextResponse.json(
                { error: 'You do not have access to this item' },
                { status: 403 }
            )
        }

        // 4. Update the open item with the response
        const { data: updatedItem, error: updateError } = await supabase
            .from('open_items')
            .update({
                client_response: response.trim(),
                status: 'responded',
                responded_at: new Date().toISOString()
            })
            .eq('id', itemId)
            .select()
            .single()

        if (updateError) {
            console.error('Error updating open item:', updateError)
            return NextResponse.json(
                { error: 'Failed to save response' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            item: {
                id: updatedItem.id,
                status: updatedItem.status,
                clientResponse: updatedItem.client_response,
                respondedAt: updatedItem.responded_at
            }
        })

    } catch (error) {
        console.error('Portal submit error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
