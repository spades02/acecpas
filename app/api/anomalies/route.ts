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

interface Anomaly {
    category: string
    period: string
    type: 'spike' | 'drop' | 'new_category' | 'missing' | 'threshold'
    severity: 'low' | 'medium' | 'high'
    message: string
    value: number
    expectedRange?: { min: number; max: number }
    percentChange?: number
}

/**
 * GET /api/anomalies?dealId=xxx
 * Analyzes P&L data and detects anomalies using statistical methods.
 */
export async function GET(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const dealId = request.nextUrl.searchParams.get('dealId')
        if (!dealId) return NextResponse.json({ error: 'Deal ID is required' }, { status: 400 })

        // Fetch the income statement data (reuse same logic or call internal)
        // For efficiency, we do a lightweight version here
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
                .select('id, category')
                .eq('is_active', true),
            supabase
                .from('client_accounts')
                .select('id, account_number')
                .eq('deal_id', dealId)
        ])

        if (glRes.error || mappingRes.error || coaRes.error || clientAccountsRes.error) {
            throw new Error('Failed to fetch data for anomaly detection')
        }

        // Build lookup maps
        const accountNumToIdMap = new Map<string, string>()
            ; (clientAccountsRes.data || []).forEach(acc => {
                if (acc.account_number) accountNumToIdMap.set(acc.account_number.toLowerCase().trim(), acc.id)
            })

        const clientToMasterMap = new Map<string, string>()
            ; (mappingRes.data || []).forEach(m => {
                if (m.master_account_id) clientToMasterMap.set(m.client_account_id, m.master_account_id)
            })

        const masterIdToCategoryMap = new Map<string, string>()
            ; (coaRes.data || []).forEach(coa => {
                if (coa.category) masterIdToCategoryMap.set(coa.id, coa.category)
            })

        // Aggregate by category + month
        const aggregated: Record<string, Record<string, number>> = {}
            ; (glRes.data || []).forEach(tx => {
                if (!tx.transaction_date || !tx.amount) return

                const date = new Date(tx.transaction_date)
                const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

                let category = 'Unmapped'
                const accNum = tx.account_number?.toLowerCase().trim()
                if (accNum) {
                    const clientAccountId = accountNumToIdMap.get(accNum)
                    if (clientAccountId) {
                        const masterAccountId = clientToMasterMap.get(clientAccountId)
                        if (masterAccountId) {
                            category = masterIdToCategoryMap.get(masterAccountId) || 'Unmapped'
                        }
                    }
                }

                if (!aggregated[category]) aggregated[category] = {}
                aggregated[category][month] = (aggregated[category][month] || 0) + tx.amount
            })

        // Detect anomalies
        const anomalies: Anomaly[] = []

        for (const [category, monthlyData] of Object.entries(aggregated)) {
            if (category === 'Unmapped') continue // Skip unmapped

            const months = Object.keys(monthlyData).sort()
            const values = months.map(m => monthlyData[m])

            if (values.length < 3) continue // Need at least 3 months for analysis

            // Calculate statistics
            const mean = values.reduce((s, v) => s + v, 0) / values.length
            const variance = values.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / values.length
            const stdDev = Math.sqrt(variance)
            const cv = mean !== 0 ? (stdDev / Math.abs(mean)) : 0 // Coefficient of variation

            // Detection 1: Z-Score anomalies (> 2 standard deviations)
            if (stdDev > 0) {
                months.forEach((month, i) => {
                    const value = values[i]
                    const zScore = Math.abs((value - mean) / stdDev)

                    if (zScore > 2) {
                        const isSpike = value > mean
                        anomalies.push({
                            category,
                            period: month,
                            type: isSpike ? 'spike' : 'drop',
                            severity: zScore > 3 ? 'high' : 'medium',
                            message: `${isSpike ? 'Spike' : 'Drop'} detected: ${formatCurrencySimple(value)} vs avg ${formatCurrencySimple(mean)} (${zScore.toFixed(1)}σ)`,
                            value,
                            expectedRange: { min: mean - 2 * stdDev, max: mean + 2 * stdDev },
                            percentChange: ((value - mean) / Math.abs(mean)) * 100
                        })
                    }
                })
            }

            // Detection 2: Month-over-month large swings (>50% change)
            for (let i = 1; i < months.length; i++) {
                const prev = values[i - 1]
                const curr = values[i]

                if (Math.abs(prev) < 100) continue // Skip tiny amounts

                const pctChange = ((curr - prev) / Math.abs(prev)) * 100

                if (Math.abs(pctChange) > 50 && Math.abs(curr - prev) > 1000) {
                    // Don't double-count if already caught by z-score
                    const alreadyCaught = anomalies.some(
                        a => a.category === category && a.period === months[i]
                    )

                    if (!alreadyCaught) {
                        anomalies.push({
                            category,
                            period: months[i],
                            type: pctChange > 0 ? 'spike' : 'drop',
                            severity: Math.abs(pctChange) > 100 ? 'high' : 'medium',
                            message: `${pctChange > 0 ? '+' : ''}${pctChange.toFixed(0)}% MoM change (${formatCurrencySimple(prev)} → ${formatCurrencySimple(curr)})`,
                            value: curr,
                            percentChange: pctChange
                        })
                    }
                }
            }

            // Detection 3: Missing months (gaps in otherwise continuous data)
            if (months.length >= 3) {
                const allMonthsSorted = months.sort()
                const firstMonth = allMonthsSorted[0]
                const lastMonth = allMonthsSorted[allMonthsSorted.length - 1]

                const [fy, fm] = firstMonth.split('-').map(Number)
                const [ly, lm] = lastMonth.split('-').map(Number)

                let cursor = new Date(fy, fm - 1)
                const end = new Date(ly, lm - 1)

                while (cursor <= end) {
                    const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`
                    if (!monthlyData[monthKey] && monthlyData[monthKey] !== 0) {
                        anomalies.push({
                            category,
                            period: monthKey,
                            type: 'missing',
                            severity: 'low',
                            message: `No transactions for ${monthKey} in ${category}`,
                            value: 0
                        })
                    }
                    cursor.setMonth(cursor.getMonth() + 1)
                }
            }
        }

        // Sort by severity (high first), then by period
        const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
        anomalies.sort((a, b) => {
            const sevDiff = (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2)
            if (sevDiff !== 0) return sevDiff
            return a.period.localeCompare(b.period)
        })

        return NextResponse.json({
            success: true,
            anomalies,
            summary: {
                total: anomalies.length,
                high: anomalies.filter(a => a.severity === 'high').length,
                medium: anomalies.filter(a => a.severity === 'medium').length,
                low: anomalies.filter(a => a.severity === 'low').length
            }
        })

    } catch (error: any) {
        console.error('Anomaly detection error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

function formatCurrencySimple(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount)
}
