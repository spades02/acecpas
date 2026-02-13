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
 * GET /api/income-statement?dealId=xxx
 * Generates the Income Statement from GL Transactions + Mappings
 */
export async function GET(request: NextRequest) {
    try {
        // 1. Auth Check
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Validate Params
        const dealId = request.nextUrl.searchParams.get('dealId')
        if (!dealId) {
            return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 })
        }

        // 3. Update Status (Optional - if we want to track progress)
        // const updateRes = await supabase.from('deals').update({ status: 'analyzing' }).eq('id', dealId)

        // 4. Fetch necessary data in parallel
        // We need: GL Transactions, Account Mappings, Master COA, Client Accounts
        const [glRes, mappingRes, coaRes, clientAccountsRes] = await Promise.all([
            // Limit columns for performance
            supabase
                .from('gl_transactions')
                .select('id, transaction_date, amount, debit_credit, account_number, account_name, description')
                .eq('deal_id', dealId),

            supabase
                .from('account_mappings')
                .select('client_account_id, master_account_id')
                .eq('deal_id', dealId),

            supabase
                .from('master_coa')
                .select('id, account_code, account_name, category, subcategory, display_order')
                .eq('is_active', true)
                .order('display_order', { ascending: true }),

            supabase
                .from('client_accounts')
                .select('id, account_number, original_account_string')
                .eq('deal_id', dealId)
        ])

        if (glRes.error) throw new Error(`GL Fetch Error: ${glRes.error.message}`)
        if (mappingRes.error) throw new Error(`Mapping Fetch Error: ${mappingRes.error.message}`)
        if (coaRes.error) throw new Error(`COA Fetch Error: ${coaRes.error.message}`)
        if (clientAccountsRes.error) throw new Error(`Client Accounts Fetch Error: ${clientAccountsRes.error.message}`)

        const glTransactions = glRes.data || []
        const mappings = mappingRes.data || []
        const masterCoa = coaRes.data || []
        const clientAccounts = clientAccountsRes.data || []

        // 5. Build Lookup Maps
        // Map: Client Account Number -> Client Account ID
        const accountNumToIdMap = new Map<string, string>()
        clientAccounts.forEach(acc => {
            if (acc.account_number) {
                accountNumToIdMap.set(acc.account_number.toLowerCase().trim(), acc.id)
            }
        })

        // Map: Client Account ID -> Master COA ID
        const clientToMasterMap = new Map<string, string>()
        mappings.forEach(m => {
            if (m.master_account_id) {
                clientToMasterMap.set(m.client_account_id, m.master_account_id)
            }
        })

        // Map: Master COA ID -> Category Info
        const masterIdToInfoMap = new Map<string, { category: string, subcategory: string, name: string, order: number }>()
        masterCoa.forEach(coa => {
            masterIdToInfoMap.set(coa.id, {
                category: coa.category || 'Unmapped',
                subcategory: coa.subcategory || 'Other',
                name: coa.account_name,
                order: coa.display_order || 999
            })
        })

        // 6. Aggregate Data
        // Structure: { [Category]: { [Month]: amount } }
        const aggregatedData: Record<string, Record<string, number>> = {}
        const allMonths = new Set<string>()

        // Initialize aggregation structure
        const categoryOrder: Record<string, number> = {}
        masterCoa.forEach(coa => {
            if (coa.category) {
                aggregatedData[coa.category] = aggregatedData[coa.category] || {}
                categoryOrder[coa.category] = Math.min(categoryOrder[coa.category] || 999, coa.display_order || 999)
            }
        })

        // Process Transactions
        let unmappedAmount = 0
        let unmappedTxCount = 0

        glTransactions.forEach(tx => {
            if (!tx.transaction_date || !tx.amount) return

            // Normalize Month (YYYY-MM)
            const date = new Date(tx.transaction_date)
            const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            allMonths.add(month)

            // Find Mapping
            let category = 'Unmapped'

            // Try to find Client Account ID
            const accountNumber = tx.account_number?.toLowerCase().trim()
            if (accountNumber) {
                const clientAccountId = accountNumToIdMap.get(accountNumber)
                if (clientAccountId) {
                    const masterAccountId = clientToMasterMap.get(clientAccountId)
                    if (masterAccountId) {
                        const masterInfo = masterIdToInfoMap.get(masterAccountId)
                        if (masterInfo) {
                            category = masterInfo.category
                        }
                    }
                }
            }

            // Adjust sign based on debit/credit and category logic if needed
            // For now, assume Amount is signed correctly (Revenue -/+, Expense +/-) or raw amounts
            // Typically GL exports have positive numbers and a Debit/Credit column.
            // Revenue: Credit is positive for P&L, Expense: Debit is positive (usually).
            // But 'amount' in DB might be signed already if parsed correctly. 
            // Let's assume 'amount' is absolute and use 'debit_credit'.

            let signedAmount = tx.amount
            if (tx.debit_credit) {
                const isCredit = tx.debit_credit.toLowerCase().startsWith('c')
                const isRevenue = category.toLowerCase().includes('revenue') || category.toLowerCase().includes('incom')

                // Accounting Logic (Simplified)
                // If Revenue: Credit = Positive, Debit = Negative
                // If Expense: Debit = Positive, Credit = Negative

                if (isRevenue) {
                    signedAmount = isCredit ? tx.amount : -tx.amount
                } else {
                    // Startups/Assets/Expenses
                    signedAmount = isCredit ? -tx.amount : tx.amount
                }
            } else {
                // Fallback if no D/C column - Assume P&L export logic usually has Revenue as positive? 
                // Or if it comes from raw dump, usually Revenue is negative (Credit).
                // If no D/C, we might just trust the amount if the parser handled it.
                // Given parser implementation was "Validate debits = credits", likely stores as is.
                // We will assume simpler logic for MVP: just sum it.
            }


            if (category === 'Unmapped') {
                unmappedAmount += signedAmount
                unmappedTxCount++
            }

            // Add to aggregation
            if (!aggregatedData[category]) aggregatedData[category] = {}
            aggregatedData[category][month] = (aggregatedData[category][month] || 0) + signedAmount
        })

        // 7. Format Response
        const sortedMonths = Array.from(allMonths).sort()

        // Define standard P&L structure order if not fully defined in COA
        const standardOrder = ['Revenue', 'Cost of Goods Sold', 'Gross Profit', 'Operating Expenses', 'Other Income', 'Other Expenses', 'Net Income', 'Unmapped']

        const lineItems = Object.keys(aggregatedData)
            .sort((a, b) => {
                // Sort by Master COA display order first
                const orderA = categoryOrder[a] || 999
                const orderB = categoryOrder[b] || 999
                if (orderA !== orderB) return orderA - orderB

                // Fallback to standard hardcoded order
                const idxA = standardOrder.indexOf(a)
                const idxB = standardOrder.indexOf(b)
                if (idxA !== -1 && idxB !== -1) return idxA - idxB
                if (idxA !== -1) return -1
                if (idxB !== -1) return 1

                return a.localeCompare(b)
            })
            .map(category => {
                const monthlyAmounts = sortedMonths.reduce((acc, month) => {
                    acc[month] = aggregatedData[category][month] || 0
                    return acc
                }, {} as Record<string, number>)

                const total = Object.values(monthlyAmounts).reduce((sum, val) => sum + val, 0)

                return {
                    category,
                    data: monthlyAmounts,
                    total
                }
            })

        // Filter out empty rows if needed, but usually we want to see them if they exist in mapping
        const finalLineItems = lineItems.filter(item => item.total !== 0 || item.category === 'Unmapped')

        // Calculate Totals (Revenue, Gross Profit, EBITDA, Net Income) - Simplified
        // Real logic would need recursive calc based on subcategories.
        // For now, client side will sum it up or we pass specific 'Total' lines.

        return NextResponse.json({
            success: true,
            periods: sortedMonths,
            lineItems: finalLineItems,
            unmapped: {
                count: unmappedTxCount,
                amount: unmappedAmount
            }
        })

    } catch (error: any) {
        console.error('Income Statement Gen Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
