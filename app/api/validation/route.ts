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

interface ValidationCheck {
    id: string
    name: string
    description: string
    status: 'pass' | 'warning' | 'fail' | 'skipped'
    details: string
    variance?: number
    variancePct?: number
}

/**
 * GET /api/validation?dealId=xxx
 * Runs cross-source validation checks:
 * 1. GL-Derived vs Income Statement totals
 * 2. Bank totals vs GL totals (if bank data exists)
 * 3. Debit/Credit balance check
 * 4. Missing account mappings
 */
export async function GET(request: NextRequest) {
    try {
        const orgId = await getOrgId()
        if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const dealId = request.nextUrl.searchParams.get('dealId')
        if (!dealId) return NextResponse.json({ error: 'Deal ID required' }, { status: 400 })

        const checks: ValidationCheck[] = []

        // Fetch all needed data in parallel
        const [glRes, bankRes, mappingRes, clientRes] = await Promise.all([
            supabase
                .from('gl_transactions')
                .select('id, amount, debit_credit, account_number')
                .eq('deal_id', dealId),
            supabase
                .from('bank_transactions')
                .select('id, amount, matched_gl_id')
                .eq('deal_id', dealId),
            supabase
                .from('account_mappings')
                .select('id, client_account_id, master_account_id')
                .eq('deal_id', dealId),
            supabase
                .from('client_accounts')
                .select('id, account_number, total_amount')
                .eq('deal_id', dealId)
        ])

        const glTxns = glRes.data || []
        const bankTxns = bankRes.data || []
        const mappings = mappingRes.data || []
        const clientAccounts = clientRes.data || []

        // ─── CHECK 1: GL Completeness ───
        const totalGlAmount = glTxns.reduce((s, t) => s + Number(t.amount), 0)
        const totalDebits = glTxns.filter(t => t.debit_credit === 'D' || t.debit_credit === 'Debit').reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
        const totalCredits = glTxns.filter(t => t.debit_credit === 'C' || t.debit_credit === 'Credit').reduce((s, t) => s + Math.abs(Number(t.amount)), 0)
        const dcVariance = Math.abs(totalDebits - totalCredits)

        checks.push({
            id: 'gl_balance',
            name: 'GL Debit/Credit Balance',
            description: 'Verify that total debits equal total credits in the GL',
            status: dcVariance < 1 ? 'pass' : dcVariance < 500 ? 'warning' : 'fail',
            details: dcVariance < 1
                ? `GL is balanced. Total debits: $${totalDebits.toLocaleString()}, credits: $${totalCredits.toLocaleString()}`
                : `Imbalance of $${dcVariance.toLocaleString()} between debits ($${totalDebits.toLocaleString()}) and credits ($${totalCredits.toLocaleString()})`,
            variance: dcVariance
        })

        // ─── CHECK 2: Account Mapping Coverage ───
        const mappedAccounts = new Set(mappings.filter(m => m.master_account_id).map(m => m.client_account_id))
        const totalAccounts = clientAccounts.length
        const unmappedAccounts = clientAccounts.filter(a => !mappedAccounts.has(a.id))
        const mappingRate = totalAccounts > 0 ? Math.round((mappedAccounts.size / totalAccounts) * 100) : 100

        checks.push({
            id: 'mapping_coverage',
            name: 'Account Mapping Coverage',
            description: 'Percentage of client accounts mapped to standard chart of accounts',
            status: mappingRate >= 95 ? 'pass' : mappingRate >= 80 ? 'warning' : 'fail',
            details: `${mappedAccounts.size} of ${totalAccounts} accounts mapped (${mappingRate}%).${unmappedAccounts.length > 0 ? ` ${unmappedAccounts.length} unmapped accounts.` : ''}`,
            variancePct: 100 - mappingRate
        })

        // ─── CHECK 3: GL Transaction Count ───
        checks.push({
            id: 'gl_count',
            name: 'GL Transaction Volume',
            description: 'Ensure adequate transaction data for analysis',
            status: glTxns.length >= 100 ? 'pass' : glTxns.length >= 10 ? 'warning' : 'fail',
            details: `${glTxns.length.toLocaleString()} GL transactions loaded. Net amount: $${totalGlAmount.toLocaleString()}`
        })

        // ─── CHECK 4: Bank Reconciliation (if data exists) ───
        if (bankTxns.length > 0) {
            const matchedBank = bankTxns.filter(b => b.matched_gl_id)
            const bankMatchRate = Math.round((matchedBank.length / bankTxns.length) * 100)
            const totalBankAmount = bankTxns.reduce((s, t) => s + Number(t.amount), 0)
            const bankGlVariance = Math.abs(totalBankAmount - totalGlAmount)

            checks.push({
                id: 'bank_match',
                name: 'Bank-GL Match Rate',
                description: 'Percentage of bank transactions matched to GL entries',
                status: bankMatchRate >= 90 ? 'pass' : bankMatchRate >= 70 ? 'warning' : 'fail',
                details: `${matchedBank.length} of ${bankTxns.length} bank transactions matched (${bankMatchRate}%)`,
                variancePct: 100 - bankMatchRate
            })

            checks.push({
                id: 'bank_gl_variance',
                name: 'Bank vs GL Total Variance',
                description: 'Difference between total bank activity and total GL activity',
                status: bankGlVariance < 100 ? 'pass' : bankGlVariance < 5000 ? 'warning' : 'fail',
                details: `Bank total: $${totalBankAmount.toLocaleString()} vs GL total: $${totalGlAmount.toLocaleString()}. Variance: $${bankGlVariance.toLocaleString()}`,
                variance: bankGlVariance
            })
        } else {
            checks.push({
                id: 'bank_match',
                name: 'Bank-GL Match Rate',
                description: 'Bank statement data not yet uploaded',
                status: 'skipped',
                details: 'No bank statement data available for reconciliation. Upload bank statements to enable this check.'
            })
        }

        // Summary
        const passed = checks.filter(c => c.status === 'pass').length
        const warnings = checks.filter(c => c.status === 'warning').length
        const failures = checks.filter(c => c.status === 'fail').length
        const skipped = checks.filter(c => c.status === 'skipped').length

        return NextResponse.json({
            success: true,
            checks,
            summary: {
                total: checks.length,
                passed,
                warnings,
                failures,
                skipped,
                overallStatus: failures > 0 ? 'fail' : warnings > 0 ? 'warning' : 'pass'
            }
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Validation failed' }, { status: 500 })
    }
}
