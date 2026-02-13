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

// Balance sheet section ordering
const BS_SECTIONS = [
    { type: 'Asset', category: 'Current Assets', section: 'CURRENT ASSETS' },
    { type: 'Asset', category: 'Fixed Assets', section: 'FIXED ASSETS' },
    { type: 'Asset', category: 'Non-Current Assets', section: 'NON-CURRENT ASSETS' },
    { type: 'Liability', category: 'Current Liabilities', section: 'CURRENT LIABILITIES' },
    { type: 'Liability', category: 'Non-Current Liabilities', section: 'NON-CURRENT LIABILITIES' },
    { type: 'Equity', category: 'Equity', section: 'EQUITY' },
]

/**
 * GET /api/balance-sheet?dealId=xxx
 * Aggregates GL transactions into Balance Sheet format.
 * Balance sheet = cumulative balances, not period flows.
 * For each period, we compute the running balance up to end of that month.
 */
export async function GET(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const dealId = request.nextUrl.searchParams.get('dealId')
        if (!dealId) return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 })

        // Fetch all data in parallel
        const [glRes, mappingRes, coaRes, clientAccountsRes] = await Promise.all([
            supabase
                .from('gl_transactions')
                .select('transaction_date, amount, debit_credit, account_number')
                .eq('deal_id', dealId),
            supabase
                .from('account_mappings')
                .select('client_account_id, master_account_id')
                .eq('deal_id', dealId),
            supabase
                .from('master_coa')
                .select('id, account_type, category, subcategory, account_name')
                .eq('is_active', true),
            supabase
                .from('client_accounts')
                .select('id, account_number')
                .eq('deal_id', dealId)
        ])

        if (glRes.error || mappingRes.error || coaRes.error || clientAccountsRes.error) {
            throw new Error(glRes.error?.message || mappingRes.error?.message || coaRes.error?.message || clientAccountsRes.error?.message || 'Failed to fetch data')
        }

        // Build lookup maps
        const accountNumToId = new Map<string, string>()
            ; (clientAccountsRes.data || []).forEach(acc => {
                if (acc.account_number) accountNumToId.set(acc.account_number.toLowerCase().trim(), acc.id)
            })

        const clientToMaster = new Map<string, string>()
            ; (mappingRes.data || []).forEach(m => {
                if (m.master_account_id) clientToMaster.set(m.client_account_id, m.master_account_id)
            })

        const masterAccounts = new Map<string, { account_type: string; category: string; subcategory: string | null; account_name: string }>()
            ; (coaRes.data || []).forEach(coa => {
                masterAccounts.set(coa.id, {
                    account_type: coa.account_type,
                    category: coa.category || 'Uncategorized',
                    subcategory: coa.subcategory,
                    account_name: coa.account_name
                })
            })

        // Filter only BS account types
        const bsAccountTypes = new Set(['Asset', 'Liability', 'Equity'])

        // Aggregate transactions by category+month
        // For BS, amounts are cumulative (running balance)
        // We first compute monthly flows, then cumulate
        const monthlyFlows: Record<string, Record<string, number>> = {}
        const allMonths = new Set<string>()
        let unmappedCount = 0
        let unmappedAmount = 0

            ; (glRes.data || []).forEach(tx => {
                if (!tx.transaction_date || !tx.amount) return

                const date = new Date(tx.transaction_date)
                const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                allMonths.add(month)

                // Resolve category
                let category = '__UNMAPPED__'
                let accountType = ''
                const accNum = tx.account_number?.toLowerCase().trim()
                if (accNum) {
                    const clientAccountId = accountNumToId.get(accNum)
                    if (clientAccountId) {
                        const masterAccountId = clientToMaster.get(clientAccountId)
                        if (masterAccountId) {
                            const master = masterAccounts.get(masterAccountId)
                            if (master && bsAccountTypes.has(master.account_type)) {
                                category = master.category
                                accountType = master.account_type
                            } else if (master) {
                                // P&L account — skip for BS
                                return
                            }
                        }
                    }
                }

                if (category === '__UNMAPPED__') {
                    unmappedCount++
                    unmappedAmount += tx.amount
                    return // Skip unmapped for BS view
                }

                if (!monthlyFlows[category]) monthlyFlows[category] = {}
                monthlyFlows[category][month] = (monthlyFlows[category][month] || 0) + tx.amount
            })

        // Sort months
        const sortedMonths = Array.from(allMonths).sort()

        // Build cumulative balances
        const lineItems: {
            category: string
            section: string
            accountType: string
            data: Record<string, number>
            total: number
            isSubtotal: boolean
            isTotalLine: boolean
            periodChanges: Record<string, { change: number; pctChange: number | null }>
        }[] = []

        // Group by BS sections
        for (const sec of BS_SECTIONS) {
            const categories = Object.keys(monthlyFlows).filter(cat => cat === sec.category)

            for (const category of categories) {
                const flows = monthlyFlows[category]
                const data: Record<string, number> = {}
                let runningBalance = 0

                for (const month of sortedMonths) {
                    runningBalance += (flows[month] || 0)
                    data[month] = runningBalance
                }

                // Period-over-period changes
                const periodChanges: Record<string, { change: number; pctChange: number | null }> = {}
                for (let i = 1; i < sortedMonths.length; i++) {
                    const curr = data[sortedMonths[i]] || 0
                    const prev = data[sortedMonths[i - 1]] || 0
                    const change = curr - prev
                    const pctChange = prev !== 0 ? ((change / Math.abs(prev)) * 100) : null
                    periodChanges[sortedMonths[i]] = { change, pctChange }
                }

                lineItems.push({
                    category,
                    section: sec.section,
                    accountType: sec.type,
                    data,
                    total: runningBalance,
                    isSubtotal: false,
                    isTotalLine: false,
                    periodChanges
                })
            }
        }

        // Compute subtotals
        const computeSubtotal = (types: string[], label: string) => {
            const items = lineItems.filter(li => types.includes(li.category))
            const data: Record<string, number> = {}
            for (const month of sortedMonths) {
                data[month] = items.reduce((sum, li) => sum + (li.data[month] || 0), 0)
            }
            const total = items.reduce((sum, li) => sum + li.total, 0)

            const periodChanges: Record<string, { change: number; pctChange: number | null }> = {}
            for (let i = 1; i < sortedMonths.length; i++) {
                const curr = data[sortedMonths[i]] || 0
                const prev = data[sortedMonths[i - 1]] || 0
                const change = curr - prev
                const pctChange = prev !== 0 ? ((change / Math.abs(prev)) * 100) : null
                periodChanges[sortedMonths[i]] = { change, pctChange }
            }

            return { category: label, section: '', accountType: '', data, total, isSubtotal: true, isTotalLine: false, periodChanges }
        }

        // Build final ordered list with subtotals
        const assetItems = lineItems.filter(li => li.accountType === 'Asset')
        const liabilityItems = lineItems.filter(li => li.accountType === 'Liability')
        const equityItems = lineItems.filter(li => li.accountType === 'Equity')

        const totalAssets = computeSubtotal(['Current Assets', 'Fixed Assets', 'Non-Current Assets'], 'Total Assets')
        const totalLiabilities = computeSubtotal(['Current Liabilities', 'Non-Current Liabilities'], 'Total Liabilities')
        const totalEquity = computeSubtotal(['Equity'], 'Total Equity')

        // Net Working Capital
        const nwcData: Record<string, number> = {}
        const currentAssets = lineItems.find(li => li.category === 'Current Assets')
        const currentLiabilities = lineItems.find(li => li.category === 'Current Liabilities')
        for (const month of sortedMonths) {
            nwcData[month] = (currentAssets?.data[month] || 0) - (currentLiabilities?.data[month] || 0)
        }
        const nwcTotal = (currentAssets?.total || 0) - (currentLiabilities?.total || 0)
        const nwcChanges: Record<string, { change: number; pctChange: number | null }> = {}
        for (let i = 1; i < sortedMonths.length; i++) {
            const curr = nwcData[sortedMonths[i]] || 0
            const prev = nwcData[sortedMonths[i - 1]] || 0
            const change = curr - prev
            const pctChange = prev !== 0 ? ((change / Math.abs(prev)) * 100) : null
            nwcChanges[sortedMonths[i]] = { change, pctChange }
        }

        // Total Liabilities + Equity
        const totalLiabEquityData: Record<string, number> = {}
        for (const month of sortedMonths) {
            totalLiabEquityData[month] = (totalLiabilities.data[month] || 0) + (totalEquity.data[month] || 0)
        }

        const finalLineItems = [
            ...assetItems,
            totalAssets,
            { category: 'Net Working Capital', section: '', accountType: '', data: nwcData, total: nwcTotal, isSubtotal: true, isTotalLine: false, periodChanges: nwcChanges },
            ...liabilityItems,
            totalLiabilities,
            ...equityItems,
            totalEquity,
            {
                category: 'Total Liabilities & Equity',
                section: '', accountType: '', data: totalLiabEquityData,
                total: (totalLiabilities.total + totalEquity.total),
                isSubtotal: false, isTotalLine: true,
                periodChanges: {} as Record<string, { change: number; pctChange: number | null }>
            }
        ]

        return NextResponse.json({
            success: true,
            periods: sortedMonths,
            lineItems: finalLineItems,
            unmapped: { count: unmappedCount, amount: unmappedAmount }
        })
    } catch (error: any) {
        console.error('Balance Sheet API error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
