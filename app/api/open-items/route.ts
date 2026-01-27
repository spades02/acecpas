import { createClient } from '@supabase/supabase-js'
import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { NextRequest, NextResponse } from 'next/server'

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

async function getProfileId(): Promise<string | null> {
    try {
        const session = await auth0.getSession()
        if (!session?.user) return null

        const { data } = await supabase
            .from('profiles')
            .select('id')
            .eq('auth0_sub', session.user.sub)
            .single()

        return (data as { id: string } | null)?.id || null
    } catch {
        return null
    }
}

/**
 * GET /api/open-items?dealId=xxx
 * List open items for a deal
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

        const { data: items, error } = await supabase
            .from('open_items')
            .select(`
        *,
        anomaly:anomalies(id, title, description, anomaly_type, severity),
        resolved_user:profiles!open_items_resolved_by_fkey(full_name)
      `)
            .eq('deal_id', dealId)
            .eq('organization_id', organizationId)
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching open items:', error)
            return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            items: items.map(item => ({
                id: item.id,
                question: item.question,
                context: item.context,
                priority: item.priority,
                status: item.status,
                clientResponse: item.client_response,
                respondedAt: item.responded_at,
                isResolved: item.is_resolved,
                resolvedBy: (item.resolved_user as { full_name: string } | null)?.full_name || null,
                resolvedAt: item.resolved_at,
                createdAt: item.created_at,
                anomaly: item.anomaly
            }))
        })

    } catch (error) {
        console.error('Open items list error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/open-items
 * Create a new open item (manual question)
 */
export async function POST(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { dealId, question, context, priority = 5, anomalyId } = body

        if (!dealId || !question?.trim()) {
            return NextResponse.json(
                { error: 'Deal ID and question are required' },
                { status: 400 }
            )
        }

        const { data: item, error } = await supabase
            .from('open_items')
            .insert({
                deal_id: dealId,
                organization_id: organizationId,
                question: question.trim(),
                context: context?.trim() || null,
                priority,
                anomaly_id: anomalyId || null,
                status: 'pending'
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating open item:', error)
            return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            item: {
                id: item.id,
                question: item.question,
                context: item.context,
                priority: item.priority,
                status: item.status,
                createdAt: item.created_at
            }
        })

    } catch (error) {
        console.error('Open item creation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * PATCH /api/open-items
 * Update an open item (resolve, edit, etc.)
 */
export async function PATCH(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, action, ...updates } = body

        if (!id) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
        }

        let updateData: Record<string, unknown> = {}

        if (action === 'resolve') {
            const profileId = await getProfileId()
            updateData = {
                is_resolved: true,
                resolved_by: profileId,
                resolved_at: new Date().toISOString()
            }
        } else if (action === 'unresolve') {
            updateData = {
                is_resolved: false,
                resolved_by: null,
                resolved_at: null
            }
        } else {
            // Generic update (question, context, priority)
            if (updates.question) updateData.question = updates.question.trim()
            if (updates.context !== undefined) updateData.context = updates.context?.trim() || null
            if (updates.priority) updateData.priority = updates.priority
        }

        const { data: item, error } = await supabase
            .from('open_items')
            .update(updateData)
            .eq('id', id)
            .eq('organization_id', organizationId)
            .select()
            .single()

        if (error) {
            console.error('Error updating open item:', error)
            return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            item: {
                id: item.id,
                question: item.question,
                context: item.context,
                priority: item.priority,
                status: item.status,
                isResolved: item.is_resolved,
                resolvedAt: item.resolved_at
            }
        })

    } catch (error) {
        console.error('Open item update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * DELETE /api/open-items?id=xxx
 * Delete an open item
 */
export async function DELETE(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const itemId = request.nextUrl.searchParams.get('id')
        if (!itemId) {
            return NextResponse.json({ error: 'Item ID is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('open_items')
            .delete()
            .eq('id', itemId)
            .eq('organization_id', organizationId)

        if (error) {
            console.error('Error deleting open item:', error)
            return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Open item deletion error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
