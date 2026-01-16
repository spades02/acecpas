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
 * GET /api/deals/[dealId]/transactions
 * List GL transactions for a deal with pagination
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

        // Parse query params
        const { searchParams } = new URL(req.url)
        const page = parseInt(searchParams.get('page') || '1')
        const pageSize = parseInt(searchParams.get('pageSize') || '50')
        const offset = (page - 1) * pageSize

        const { data: transactions, error, count } = await getSupabase()
            .from('gl_transactions')
            .select('*', { count: 'exact' })
            .eq('deal_id', dealId)
            .eq('organization_id', profile.organization_id)
            .order('transaction_date', { ascending: false })
            .range(offset, offset + pageSize - 1)

        if (error) {
            console.error('Error fetching transactions:', error)
            return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
        }

        return NextResponse.json({
            transactions: transactions || [],
            totalCount: count || 0,
            page,
            pageSize
        })
    } catch (error) {
        console.error('Transactions GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/deals/[dealId]/transactions
 * Bulk insert transactions (from file processing)
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
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

        if (!Array.isArray(body.transactions)) {
            return NextResponse.json(
                { error: 'Body must contain transactions array' },
                { status: 400 }
            )
        }

        // Add organization_id and deal_id to each transaction
        const transactionsWithOrg = body.transactions.map((t: Record<string, unknown>, index: number) => ({
            deal_id: dealId,
            organization_id: profile.organization_id,
            file_id: body.file_id || null,
            transaction_date: t.transaction_date || null,
            account_number: t.account_number || null,
            account_name: t.account_name || null,
            description: t.description || null,
            vendor_name: t.vendor_name || null,
            amount: t.amount || 0,
            debit_credit: t.debit_credit || null,
            original_data: t.original_data || t,
            row_number: index + 1
        }))

        const { data: transactions, error } = await getSupabase()
            .from('gl_transactions')
            .insert(transactionsWithOrg)
            .select()

        if (error) {
            console.error('Error inserting transactions:', error)
            return NextResponse.json({ error: 'Failed to insert transactions' }, { status: 500 })
        }

        return NextResponse.json({
            inserted: transactions?.length || 0,
            transactions
        }, { status: 201 })
    } catch (error) {
        console.error('Transactions POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
