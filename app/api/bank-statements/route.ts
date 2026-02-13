import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const auth0 = new Auth0Client()

async function getOrgId(): Promise<string | null> {
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
 * GET /api/bank-statements?dealId=xxx
 * Returns bank transactions with match status summary
 */
export async function GET(request: NextRequest) {
    try {
        const orgId = await getOrgId()
        if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const dealId = request.nextUrl.searchParams.get('dealId')
        if (!dealId) return NextResponse.json({ error: 'Deal ID required' }, { status: 400 })

        const { data: bankTxns, error } = await supabase
            .from('bank_transactions')
            .select('*')
            .eq('deal_id', dealId)
            .order('transaction_date', { ascending: true })

        if (error) throw error

        const matched = (bankTxns || []).filter(t => t.matched_gl_id)
        const unmatched = (bankTxns || []).filter(t => !t.matched_gl_id)

        return NextResponse.json({
            success: true,
            transactions: bankTxns || [],
            summary: {
                total: bankTxns?.length || 0,
                matched: matched.length,
                unmatched: unmatched.length,
                matchRate: bankTxns?.length ? Math.round((matched.length / bankTxns.length) * 100) : 0,
                totalAmount: (bankTxns || []).reduce((s, t) => s + Number(t.amount), 0),
                matchedAmount: matched.reduce((s, t) => s + Number(t.amount), 0),
                unmatchedAmount: unmatched.reduce((s, t) => s + Number(t.amount), 0)
            }
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Failed to fetch bank transactions' }, { status: 500 })
    }
}

/**
 * POST /api/bank-statements
 * Parses bank statement CSV data and runs auto-matching against GL
 * Body: { dealId, transactions: [{ date, description, amount, reference?, bankAccount? }] }
 */
export async function POST(request: NextRequest) {
    try {
        const orgId = await getOrgId()
        if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const { dealId, transactions } = body

        if (!dealId || !transactions?.length) {
            return NextResponse.json({ error: 'dealId and transactions required' }, { status: 400 })
        }

        // Fetch GL transactions for matching
        const { data: glTxns, error: glErr } = await supabase
            .from('gl_transactions')
            .select('id, transaction_date, amount, description, account_name, vendor_name')
            .eq('deal_id', dealId)

        if (glErr) throw glErr

        // Build GL lookup for matching: group by date bucket + amount
        const glByDay = new Map<string, typeof glTxns>()
            ; (glTxns || []).forEach(gl => {
                if (!gl.transaction_date) return
                // Create entries for +/- 3 day window
                const d = new Date(gl.transaction_date)
                for (let offset = -3; offset <= 3; offset++) {
                    const dayKey = new Date(d.getTime() + offset * 86400000).toISOString().substring(0, 10)
                    const key = `${dayKey}|${Math.abs(Number(gl.amount)).toFixed(2)}`
                    if (!glByDay.has(key)) glByDay.set(key, [])
                    glByDay.get(key)!.push(gl)
                }
            })

        // Process each bank transaction
        const bankRows = transactions.map((tx: any, i: number) => {
            const txDate = tx.date
            const txAmount = Math.abs(Number(tx.amount))
            const matchKey = `${txDate}|${txAmount.toFixed(2)}`

            // Try exact amount + date window match
            let matchedGlId: string | null = null
            let matchConfidence: number | null = null
            let matchMethod: string | null = null

            const candidates = glByDay.get(matchKey)
            if (candidates && candidates.length > 0) {
                // Pick best candidate (exact date preferred)
                const exactDate = candidates.find(c => c.transaction_date === txDate)
                const match = exactDate || candidates[0]
                matchedGlId = match.id
                matchConfidence = exactDate ? 95 : 80
                matchMethod = exactDate ? 'exact_date_amount' : 'fuzzy_date_amount'
            }

            return {
                deal_id: dealId,
                organization_id: orgId,
                transaction_date: txDate,
                description: tx.description || '',
                amount: tx.amount,
                bank_account: tx.bankAccount || null,
                reference: tx.reference || null,
                matched_gl_id: matchedGlId,
                match_confidence: matchConfidence,
                match_method: matchMethod,
                is_reconciled: false,
                row_number: i + 1,
                original_data: tx
            }
        })

        // Insert bank transactions
        const { data: inserted, error: insertErr } = await supabase
            .from('bank_transactions')
            .insert(bankRows)
            .select('id, matched_gl_id, match_confidence')

        if (insertErr) throw insertErr

        const matchedCount = (inserted || []).filter(r => r.matched_gl_id).length

        return NextResponse.json({
            success: true,
            inserted: inserted?.length || 0,
            matched: matchedCount,
            unmatched: (inserted?.length || 0) - matchedCount,
            matchRate: inserted?.length ? Math.round((matchedCount / inserted.length) * 100) : 0
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Failed to process bank statements' }, { status: 500 })
    }
}
