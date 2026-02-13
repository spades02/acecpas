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
    params: Promise<{ dealId: string; fileId: string }>
}

/**
 * DELETE /api/deals/[dealId]/files/[fileId]
 * Delete a file and its storage object
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        const { dealId, fileId } = await params
        const session = await getAuth0().getSession(req)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user profile to check organization access
        const { data: profile } = await getSupabase()
            .from('profiles')
            .select('organization_id')
            .eq('auth0_sub', session.user.sub)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        // 1. Fetch file record to verify ownership and get storage path
        const { data: file, error: fetchError } = await getSupabase()
            .from('uploaded_files')
            .select('storage_path, organization_id')
            .eq('id', fileId)
            .eq('deal_id', dealId)
            .eq('organization_id', profile.organization_id)
            .single()

        if (fetchError || !file) {
            return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 })
        }

        // 2. Delete from Supabase Storage
        if (file.storage_path) {
            const { error: storageError } = await getSupabase()
                .storage
                .from('deal_files')
                .remove([file.storage_path])

            if (storageError) {
                console.error('Storage delete error:', storageError)
                // Continue — better to clean up DB so UI updates
            }
        }

        // 3. Delete parsed GL transactions linked to this file
        const { error: glDeleteError } = await getSupabase()
            .from('gl_transactions')
            .delete()
            .eq('file_id', fileId)

        if (glDeleteError) {
            console.error('GL transactions cleanup error:', glDeleteError)
            // Continue with file deletion
        }

        // 4. Delete the file record from database
        const { error: deleteError } = await getSupabase()
            .from('uploaded_files')
            .delete()
            .eq('id', fileId)

        if (deleteError) {
            console.error('Database delete error:', deleteError)
            return NextResponse.json({ error: 'Failed to delete file record' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('File DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
