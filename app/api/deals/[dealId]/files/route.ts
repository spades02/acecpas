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
 * GET /api/deals/[dealId]/files
 * List files for a deal
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

        const { data: files, error } = await getSupabase()
            .from('files')
            .select('*, uploaded_user:profiles!files_uploaded_by_fkey(full_name)')
            .eq('deal_id', dealId)
            .eq('organization_id', profile.organization_id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching files:', error)
            return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
        }

        return NextResponse.json({ files: files || [] })
    } catch (error) {
        console.error('Files GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/deals/[dealId]/files
 * Create file record (after upload to storage)
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
            .select('id, organization_id')
            .eq('auth0_sub', session.user.sub)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const body = await req.json()

        if (!body.filename || !body.storage_path) {
            return NextResponse.json(
                { error: 'Missing required fields: filename, storage_path' },
                { status: 400 }
            )
        }

        const { data: file, error } = await getSupabase()
            .from('files')
            .insert({
                deal_id: dealId,
                organization_id: profile.organization_id,
                filename: body.filename,
                original_filename: body.original_filename || body.filename,
                file_type: body.file_type || null,
                file_size: body.file_size || null,
                storage_path: body.storage_path,
                status: 'pending',
                uploaded_by: profile.id
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating file:', error)
            return NextResponse.json({ error: 'Failed to create file' }, { status: 500 })
        }

        return NextResponse.json({ file }, { status: 201 })
    } catch (error) {
        console.error('Files POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
