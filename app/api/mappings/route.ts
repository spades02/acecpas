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

/**
 * GET /api/mappings?dealId=xxx
 * Get all account mappings for a deal
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

        // Get client accounts with their mappings
        const { data: accounts, error } = await supabase
            .from('client_accounts')
            .select(`
                id,
                original_account_string,
                account_number,
                account_name,
                vendor_name,
                description,
                transaction_count,
                total_amount,
                mappings:account_mappings(
                    id,
                    confidence_score,
                    approval_status,
                    ai_reasoning,
                    master_account:master_coa(id, account_code, account_name, account_type, category)
                )
            `)
            .eq('deal_id', dealId)
            .eq('organization_id', organizationId)
            .order('original_account_string')

        if (error) {
            console.error('Error fetching mappings:', error)
            return NextResponse.json({ error: 'Failed to fetch mappings' }, { status: 500 })
        }

        // Transform to a flatter structure for the UI
        const mappings = (accounts || []).map((account: any) => {
            const mapping = account.mappings?.[0] // Get the latest mapping
            return {
                id: account.id,
                originalAccount: account.original_account_string,
                accountNumber: account.account_number,
                accountName: account.account_name,
                description: account.description,
                vendorName: account.vendor_name,
                transactionCount: account.transaction_count,
                totalAmount: account.total_amount,
                // Mapping info
                mappingId: mapping?.id || null,
                mappedTo: mapping?.master_account?.account_name || null,
                mappedToCode: mapping?.master_account?.account_code || null,
                mappedToId: mapping?.master_account?.id || null,
                category: mapping?.master_account?.category || null,
                confidence: mapping?.confidence_score || 0,
                approvalStatus: mapping?.approval_status || 'red',
                aiReasoning: mapping?.ai_reasoning || null,
                status: mapping?.approval_status === 'green'
                    ? 'auto-approved'
                    : mapping?.approval_status === 'yellow'
                        ? 'needs-review'
                        : 'unmapped'
            }
        })

        return NextResponse.json({
            success: true,
            mappings,
            stats: {
                total: mappings.length,
                autoApproved: mappings.filter((m: any) => m.status === 'auto-approved').length,
                needsReview: mappings.filter((m: any) => m.status === 'needs-review').length,
                unmapped: mappings.filter((m: any) => m.status === 'unmapped').length
            }
        })

    } catch (error) {
        console.error('Mappings list error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/mappings
 * Create or update a mapping
 */
export async function POST(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { dealId, clientAccountId, masterAccountId, confidenceScore, aiReasoning } = body

        if (!dealId || !clientAccountId || !masterAccountId) {
            return NextResponse.json(
                { error: 'Deal ID, client account ID, and master account ID are required' },
                { status: 400 }
            )
        }

        // Check if mapping already exists
        const { data: existingMapping } = await supabase
            .from('account_mappings')
            .select('id')
            .eq('client_account_id', clientAccountId)
            .single()

        let result

        if (existingMapping) {
            // Update existing mapping
            const { data, error } = await supabase
                .from('account_mappings')
                .update({
                    master_account_id: masterAccountId,
                    confidence_score: confidenceScore || 100,
                    approval_status: 'yellow', // Manual mappings need review
                    ai_reasoning: aiReasoning || null
                })
                .eq('id', existingMapping.id)
                .select()
                .single()

            if (error) throw error
            result = data
        } else {
            // Create new mapping
            const { data, error } = await supabase
                .from('account_mappings')
                .insert({
                    deal_id: dealId,
                    organization_id: organizationId,
                    client_account_id: clientAccountId,
                    master_account_id: masterAccountId,
                    confidence_score: confidenceScore || 100,
                    approval_status: 'yellow',
                    ai_reasoning: aiReasoning || null
                })
                .select()
                .single()

            if (error) throw error
            result = data
        }

        return NextResponse.json({
            success: true,
            mapping: result
        })

    } catch (error) {
        console.error('Mapping creation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * PATCH /api/mappings
 * Approve or reject a mapping
 */
export async function PATCH(request: NextRequest) {
    try {
        const organizationId = await getOrganizationId()
        if (!organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const session = await auth0.getSession()
        const body = await request.json()
        const { mappingId, action } = body

        if (!mappingId || !action) {
            return NextResponse.json(
                { error: 'Mapping ID and action are required' },
                { status: 400 }
            )
        }

        // Get the user's profile ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('auth0_sub', session!.user.sub)
            .single()

        let updateData: Record<string, unknown> = {}

        if (action === 'approve') {
            updateData = {
                approval_status: 'green',
                approved_by: profile?.id || null,
                approved_at: new Date().toISOString()
            }
        } else if (action === 'reject') {
            updateData = {
                approval_status: 'red',
                approved_by: null,
                approved_at: null
            }
        } else if (action === 'review') {
            updateData = {
                approval_status: 'yellow',
                approved_by: null,
                approved_at: null
            }
        }

        const { data: mapping, error } = await supabase
            .from('account_mappings')
            .update(updateData)
            .eq('id', mappingId)
            .eq('organization_id', organizationId)
            .select()
            .single()

        if (error) {
            console.error('Error updating mapping:', error)
            return NextResponse.json({ error: 'Failed to update mapping' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            mapping: {
                id: mapping.id,
                approvalStatus: mapping.approval_status,
                approvedAt: mapping.approved_at
            }
        })

    } catch (error) {
        console.error('Mapping update error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
