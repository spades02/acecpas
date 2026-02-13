import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { createClient } from '@supabase/supabase-js'
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

/**
 * GET /api/drill-down?dealId=xxx&category=Revenue&period=2024-01
 * Returns GL transactions for a specific P&L category and period.
 */
export async function GET(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const dealId = request.nextUrl.searchParams.get('dealId')
        const category = request.nextUrl.searchParams.get('category')
        const period = request.nextUrl.searchParams.get('period')

        if (!dealId) {
            return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 })
        }
        if (!category) {
            return NextResponse.json({ error: 'Category is required' }, { status: 400 })
        }

        // 1. Get master COA accounts that belong to this category
        const { data: coaAccounts, error: coaError } = await supabase
            .from('master_coa')
            .select('id, account_code, account_name')
            .eq('category', category)
            .eq('is_active', true)

        if (coaError) throw new Error(`COA Error: ${coaError.message}`)

        const masterAccountIds = (coaAccounts || []).map(a => a.id)

        // 2. Get account mappings for this deal that map to any of these master accounts
        let clientAccountIds: string[] = []

        if (masterAccountIds.length > 0) {
            const { data: mappings, error: mapError } = await supabase
                .from('account_mappings')
                .select('client_account_id')
                .eq('deal_id', dealId)
                .in('master_account_id', masterAccountIds)

            if (mapError) throw new Error(`Mapping Error: ${mapError.message}`)
            clientAccountIds = (mappings || []).map(m => m.client_account_id)
        }

        // 3. Get the account numbers from client_accounts
        let accountNumbers: string[] = []

        if (clientAccountIds.length > 0) {
            const { data: clientAccounts, error: caError } = await supabase
                .from('client_accounts')
                .select('account_number, original_account_string')
                .in('id', clientAccountIds)

            if (caError) throw new Error(`Client Account Error: ${caError.message}`)
            accountNumbers = (clientAccounts || [])
                .map(ca => ca.account_number)
                .filter(Boolean) as string[]
        }

        // Handle "Unmapped" category specially
        if (category === 'Unmapped') {
            // Get ALL mapped account numbers first
            const { data: allMappings } = await supabase
                .from('account_mappings')
                .select('client_account_id')
                .eq('deal_id', dealId)
                .not('master_account_id', 'is', null)

            const mappedClientIds = (allMappings || []).map(m => m.client_account_id)

            const { data: mappedClientAccounts } = await supabase
                .from('client_accounts')
                .select('account_number')
                .in('id', mappedClientIds)

            const mappedAccountNumbers = (mappedClientAccounts || [])
                .map(ca => ca.account_number?.toLowerCase().trim())
                .filter(Boolean) as string[]

            // Fetch GL transactions NOT in mapped accounts
            let query = supabase
                .from('gl_transactions')
                .select('id, transaction_date, account_number, account_name, description, vendor_name, amount, debit_credit')
                .eq('deal_id', dealId)
                .order('transaction_date', { ascending: false })
                .limit(500)

            if (period) {
                const [year, month] = period.split('-').map(Number)
                const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
                const endDate = new Date(year, month, 0).toISOString().split('T')[0]
                query = query.gte('transaction_date', startDate).lte('transaction_date', endDate)
            }

            const { data: allTx, error: txError } = await query
            if (txError) throw new Error(`GL Error: ${txError.message}`)

            // Filter out mapped ones in memory
            const unmappedTx = (allTx || []).filter(tx => {
                const accNum = tx.account_number?.toLowerCase().trim()
                return !accNum || !mappedAccountNumbers.includes(accNum)
            })

            const totalAmount = unmappedTx.reduce((sum, tx) => sum + (tx.amount || 0), 0)

            return NextResponse.json({
                success: true,
                category,
                period: period || 'All',
                transactions: unmappedTx,
                summary: {
                    count: unmappedTx.length,
                    totalAmount
                }
            })
        }

        // 4. Fetch GL transactions matching those account numbers + optional period
        if (accountNumbers.length === 0) {
            return NextResponse.json({
                success: true,
                category,
                period: period || 'All',
                transactions: [],
                summary: { count: 0, totalAmount: 0 }
            })
        }

        let query = supabase
            .from('gl_transactions')
            .select('id, transaction_date, account_number, account_name, description, vendor_name, amount, debit_credit')
            .eq('deal_id', dealId)
            .in('account_number', accountNumbers)
            .order('transaction_date', { ascending: false })
            .limit(500)

        // Apply period filter if provided
        if (period) {
            const [year, month] = period.split('-').map(Number)
            const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
            const endDate = new Date(year, month, 0).toISOString().split('T')[0]
            query = query.gte('transaction_date', startDate).lte('transaction_date', endDate)
        }

        const { data: transactions, error: txError } = await query
        if (txError) throw new Error(`GL Error: ${txError.message}`)

        const txList = transactions || []
        const totalAmount = txList.reduce((sum, tx) => sum + (tx.amount || 0), 0)

        return NextResponse.json({
            success: true,
            category,
            period: period || 'All',
            transactions: txList,
            summary: {
                count: txList.length,
                totalAmount
            }
        })

    } catch (error: any) {
        console.error('Drill-down error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
