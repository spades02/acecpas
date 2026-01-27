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
 * POST /api/deals/[dealId]/upload
 * Upload a file to storage and create DB record (uses service role to bypass RLS)
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const { dealId } = await params
        const session = await getAuth0().getSession(req)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get user profile
        const { data: profile } = await getSupabase()
            .from('profiles')
            .select('id, organization_id')
            .eq('auth0_sub', session.user.sub)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        // Parse the multipart form data
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file size (50MB max)
        const maxSize = 50 * 1024 * 1024
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 50MB.' },
                { status: 400 }
            )
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`
        const storagePath = `${dealId}/${uniqueName}`

        // Convert File to ArrayBuffer for upload
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Upload to Supabase Storage using service role (bypasses RLS)
        const { error: uploadError } = await getSupabase()
            .storage
            .from('deal_files')
            .upload(storagePath, buffer, {
                contentType: file.type,
                upsert: false
            })

        if (uploadError) {
            console.error('Storage upload error:', uploadError)
            return NextResponse.json(
                { error: `Upload failed: ${uploadError.message}` },
                { status: 500 }
            )
        }

        // Create database record
        const { data: fileRecord, error: dbError } = await getSupabase()
            .from('files')
            .insert({
                deal_id: dealId,
                organization_id: profile.organization_id,
                filename: uniqueName,
                original_filename: file.name,
                file_type: file.type,
                file_size: file.size,
                storage_path: storagePath,
                status: 'pending',
                uploaded_by: profile.id
            })
            .select()
            .single()

        if (dbError) {
            console.error('Database insert error:', dbError)
            // Try to clean up the uploaded file
            await getSupabase().storage.from('deal_files').remove([storagePath])
            return NextResponse.json(
                { error: 'Failed to create file record' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            file: {
                id: fileRecord.id,
                filename: fileRecord.original_filename,
                storagePath: fileRecord.storage_path,
                size: fileRecord.file_size,
                type: fileRecord.file_type,
                status: fileRecord.status
            }
        }, { status: 201 })

    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
