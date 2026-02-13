import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const auth0 = new Auth0Client()

async function getUserContext() {
    try {
        const session = await auth0.getSession()
        if (!session?.user) return null

        const { data } = await supabase
            .from('profiles')
            .select('organization_id, auth0_sub')
            .eq('auth0_sub', session.user.sub)
            .single()

        return data as { organization_id: string; auth0_sub: string } | null
    } catch {
        return null
    }
}

/**
 * GET /api/adjustments?dealId=xxx
 * List all adjustments for a deal
 */
export async function GET(request: NextRequest) {
    try {
        const user = await getUserContext()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const dealId = request.nextUrl.searchParams.get('dealId')
        if (!dealId) return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 })

        const { data, error } = await supabase
            .from('adjustments')
            .select('*')
            .eq('deal_id', dealId)
            .eq('organization_id', user.organization_id)
            .order('created_at', { ascending: false })

        if (error) throw new Error(error.message)

        // Calculate summary
        const adjustments = data || []
        const totalAddbacks = adjustments
            .filter(a => a.amount > 0 && (a.status === 'approved' || a.status === 'draft'))
            .reduce((sum, a) => sum + Number(a.amount), 0)
        const totalDeductions = adjustments
            .filter(a => a.amount < 0 && (a.status === 'approved' || a.status === 'draft'))
            .reduce((sum, a) => sum + Number(a.amount), 0)
        const pendingCount = adjustments.filter(a => a.status === 'pending_review').length

        return NextResponse.json({
            success: true,
            adjustments,
            summary: {
                total: adjustments.length,
                totalAddbacks,
                totalDeductions,
                netAdjustment: totalAddbacks + totalDeductions,
                pendingCount
            }
        })
    } catch (error: any) {
        console.error('Adjustments GET error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * POST /api/adjustments
 * Create a new adjustment
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getUserContext()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { dealId, category, subcategory, description, amount, period, sourceType, sourceTransactionId, sourceTransactionDescription } = body

        if (!dealId || !category || !description || amount === undefined) {
            return NextResponse.json({ error: 'Required fields: dealId, category, description, amount' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('adjustments')
            .insert({
                deal_id: dealId,
                organization_id: user.organization_id,
                category,
                subcategory: subcategory || null,
                description,
                amount,
                period: period || null,
                source_type: sourceType || 'manual',
                source_transaction_id: sourceTransactionId || null,
                source_transaction_description: sourceTransactionDescription || null,
                status: 'draft',
                created_by: user.auth0_sub
            })
            .select()
            .single()

        if (error) throw new Error(error.message)

        return NextResponse.json({ success: true, adjustment: data })
    } catch (error: any) {
        console.error('Adjustments POST error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * PATCH /api/adjustments
 * Update an existing adjustment (edit fields or change status)
 */
export async function PATCH(request: NextRequest) {
    try {
        const user = await getUserContext()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { id, ...updates } = body

        if (!id) return NextResponse.json({ error: 'Adjustment ID is required' }, { status: 400 })

        // Map camelCase to snake_case for DB
        const dbUpdates: Record<string, any> = {}
        if (updates.category !== undefined) dbUpdates.category = updates.category
        if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory
        if (updates.description !== undefined) dbUpdates.description = updates.description
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount
        if (updates.period !== undefined) dbUpdates.period = updates.period
        if (updates.status !== undefined) {
            dbUpdates.status = updates.status
            if (updates.status === 'approved' || updates.status === 'rejected') {
                dbUpdates.reviewed_by = user.auth0_sub
                dbUpdates.reviewed_at = new Date().toISOString()
            }
        }
        if (updates.reviewNotes !== undefined) dbUpdates.review_notes = updates.reviewNotes

        const { data, error } = await supabase
            .from('adjustments')
            .update(dbUpdates)
            .eq('id', id)
            .eq('organization_id', user.organization_id)
            .select()
            .single()

        if (error) throw new Error(error.message)

        return NextResponse.json({ success: true, adjustment: data })
    } catch (error: any) {
        console.error('Adjustments PATCH error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * DELETE /api/adjustments?id=xxx
 * Delete an adjustment
 */
export async function DELETE(request: NextRequest) {
    try {
        const user = await getUserContext()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const id = request.nextUrl.searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'Adjustment ID is required' }, { status: 400 })

        const { error } = await supabase
            .from('adjustments')
            .delete()
            .eq('id', id)
            .eq('organization_id', user.organization_id)

        if (error) throw new Error(error.message)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Adjustments DELETE error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
