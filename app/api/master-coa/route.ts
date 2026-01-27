import { createClient } from '@supabase/supabase-js'
import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const auth0 = new Auth0Client()

/**
 * GET /api/master-coa
 * Get all master chart of accounts entries
 */
export async function GET(request: NextRequest) {
    try {
        // Verify the user is authenticated
        const session = await auth0.getSession()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Optional search query
        const search = request.nextUrl.searchParams.get('search')
        const accountType = request.nextUrl.searchParams.get('type')

        let query = supabase
            .from('master_coa')
            .select('*')
            .eq('is_active', true)
            .order('display_order')

        if (search) {
            query = query.or(`account_name.ilike.%${search}%,account_code.ilike.%${search}%,category.ilike.%${search}%`)
        }

        if (accountType) {
            query = query.eq('account_type', accountType)
        }

        const { data: accounts, error } = await query

        if (error) {
            console.error('Error fetching master COA:', error)
            return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            accounts: (accounts || []).map((a: any) => ({
                id: a.id,
                code: a.account_code,
                name: a.account_name,
                type: a.account_type,
                category: a.category,
                subcategory: a.subcategory,
                description: a.description
            }))
        })

    } catch (error) {
        console.error('Master COA fetch error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
