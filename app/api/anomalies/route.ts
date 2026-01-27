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
 * GET /api/anomalies?dealId=xxx
 * List anomalies for a deal
 */
export async function GET(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const dealId = request.nextUrl.searchParams.get('dealId')
        const unresolvedOnly = request.nextUrl.searchParams.get('unresolved') === 'true'

        if (!dealId) {
            return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 })
        }

        let query = supabase
            .from('anomalies')
            .select(`
        *,
        transaction:gl_transactions(id, account_name, vendor_name, amount, transaction_date),
        resolved_user:profiles!anomalies_resolved_by_fkey(full_name)
      `)
            .eq('deal_id', dealId)
            .eq('organization_id', organizationId)
            .order('severity', { ascending: false })
            .order('created_at', { ascending: false })

        if (unresolvedOnly) {
            query = query.eq('is_resolved', false)
        }

        const { data: anomalies, error } = await query

        if (error) {
            console.error('Error fetching anomalies:', error)
            return NextResponse.json({ error: 'Failed to fetch anomalies' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            anomalies: anomalies.map(a => ({
                id: a.id,
                type: a.anomaly_type,
                severity: a.severity,
                title: a.title,
                description: a.description,
                detectedValue: a.detected_value,
                expectedValue: a.expected_value,
                isResolved: a.is_resolved,
                resolvedBy: (a.resolved_user as { full_name: string } | null)?.full_name || null,
                resolvedAt: a.resolved_at,
                resolutionNotes: a.resolution_notes,
                createdAt: a.created_at,
                transaction: a.transaction
            }))
        })

    } catch (error) {
        console.error('Anomalies list error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/anomalies
 * Create a new anomaly (manual detection)
 */
export async function POST(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            dealId,
            transactionId,
            anomalyType,
            severity = 5,
            title,
            description,
            detectedValue,
            expectedValue
        } = body

        if (!dealId || !title?.trim() || !anomalyType) {
            return NextResponse.json(
                { error: 'Deal ID, title, and anomaly type are required' },
                { status: 400 }
            )
        }

        const { data: anomaly, error } = await supabase
            .from('anomalies')
            .insert({
                deal_id: dealId,
                organization_id: organizationId,
                transaction_id: transactionId || null,
                anomaly_type: anomalyType,
                severity,
                title: title.trim(),
                description: description?.trim() || null,
                detected_value: detectedValue || null,
                expected_value: expectedValue || null
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating anomaly:', error)
            return NextResponse.json({ error: 'Failed to create anomaly' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            anomaly: {
                id: anomaly.id,
                type: anomaly.anomaly_type,
                severity: anomaly.severity,
                title: anomaly.title,
                createdAt: anomaly.created_at
            }
        })

    } catch (error) {
        console.error('Anomaly creation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * PATCH /api/anomalies
 * Update/resolve an anomaly
 */
export async function PATCH(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, action, resolutionNotes, ...updates } = body

        if (!id) {
            return NextResponse.json({ error: 'Anomaly ID is required' }, { status: 400 })
        }

        let updateData: Record<string, unknown> = {}

        if (action === 'resolve') {
            const profileId = await getProfileId()
            updateData = {
                is_resolved: true,
                resolved_by: profileId,
                resolved_at: new Date().toISOString(),
                resolution_notes: resolutionNotes?.trim() || null
            }
        } else if (action === 'unresolve') {
            updateData = {
                is_resolved: false,
                resolved_by: null,
                resolved_at: null,
                resolution_notes: null
            }
        } else {
            // Generic update
            if (updates.severity) updateData.severity = updates.severity
            if (updates.title) updateData.title = updates.title.trim()
            if (updates.description !== undefined) updateData.description = updates.description?.trim() || null
        }

        const { data: anomaly, error } = await supabase
            .from('anomalies')
            .update(updateData)
            .eq('id', id)
            .eq('organization_id', organizationId)
            .select()
            .single()

        if (error) {
            console.error('Error updating anomaly:', error)
            return NextResponse.json({ error: 'Failed to update anomaly' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            anomaly: {
                id: anomaly.id,
                isResolved: anomaly.is_resolved,
                resolvedAt: anomaly.resolved_at,
                resolutionNotes: anomaly.resolution_notes
            }
        })

    } catch (error) {
        console.error('Anomaly update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * DELETE /api/anomalies?id=xxx
 * Delete an anomaly
 */
export async function DELETE(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const anomalyId = request.nextUrl.searchParams.get('id')
        if (!anomalyId) {
            return NextResponse.json({ error: 'Anomaly ID is required' }, { status: 400 })
        }

        const { error } = await supabase
            .from('anomalies')
            .delete()
            .eq('id', anomalyId)
            .eq('organization_id', organizationId)

        if (error) {
            console.error('Error deleting anomaly:', error)
            return NextResponse.json({ error: 'Failed to delete anomaly' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Anomaly deletion error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
