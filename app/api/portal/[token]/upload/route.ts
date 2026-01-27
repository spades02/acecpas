import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { MagicLink, TablesInsert } from '@/types/database.types'

// Use service role for storage operations - we don't use Database generic
// since the schema types can cause issues with inferred 'never' types
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'text/csv'
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * POST /api/portal/[token]/upload
 * Upload a file attachment for an open item response
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params

        // 1. Validate the magic link
        const { data: magicLinkData, error: linkError } = await supabase
            .from('magic_links')
            .select('*')
            .eq('token', token)
            .single()

        const magicLink = magicLinkData as MagicLink | null

        if (linkError || !magicLink) {
            return NextResponse.json(
                { error: 'Invalid or expired link' },
                { status: 404 }
            )
        }

        // 2. Check expiry
        if (new Date(magicLink.expires_at) < new Date()) {
            return NextResponse.json(
                { error: 'This link has expired' },
                { status: 410 }
            )
        }

        // 3. Parse the multipart form data
        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const itemId = formData.get('itemId') as string | null

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        if (!itemId) {
            return NextResponse.json(
                { error: 'Item ID is required' },
                { status: 400 }
            )
        }

        // 4. Verify item is in scope
        if (!magicLink.scope.includes(itemId)) {
            return NextResponse.json(
                { error: 'You do not have access to this item' },
                { status: 403 }
            )
        }

        // 5. Validate file type and size
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'File type not allowed. Please upload PDF, Excel, CSV, or image files.' },
                { status: 400 }
            )
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 10MB.' },
                { status: 400 }
            )
        }

        // 6. Generate unique filename
        const ext = file.name.split('.').pop() || 'bin'
        const timestamp = Date.now()
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const storagePath = `portal-uploads/${magicLink.deal_id}/${itemId}/${timestamp}_${safeName}`

        // 7. Upload to Supabase Storage
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('attachments')
            .upload(storagePath, buffer, {
                contentType: file.type,
                upsert: false
            })

        if (uploadError) {
            console.error('Upload error:', uploadError)
            return NextResponse.json(
                { error: 'Failed to upload file' },
                { status: 500 }
            )
        }

        // 8. Get the public URL (or signed URL for private bucket)
        const { data: urlData } = supabase.storage
            .from('attachments')
            .getPublicUrl(storagePath)

        // 9. Store file metadata in the files table
        const { data: fileRecord, error: dbError } = await supabase
            .from('files')
            .insert({
                deal_id: magicLink.deal_id,
                organization_id: magicLink.organization_id,
                filename: storagePath,
                original_filename: file.name,
                file_type: file.type,
                file_size: file.size,
                storage_path: storagePath,
                status: 'completed'
            })
            .select()
            .single()

        if (dbError) {
            console.error('DB error:', dbError)
            // File is uploaded but metadata failed - still return success
        }

        return NextResponse.json({
            success: true,
            file: {
                id: fileRecord?.id || null,
                filename: file.name,
                size: file.size,
                type: file.type,
                url: urlData.publicUrl,
                storagePath
            }
        })

    } catch (error) {
        console.error('Portal upload error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/portal/[token]/upload?itemId=xxx
 * List files uploaded for an open item
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        const itemId = request.nextUrl.searchParams.get('itemId')

        // 1. Validate the magic link
        const { data: magicLinkData, error: linkError } = await supabase
            .from('magic_links')
            .select('*')
            .eq('token', token)
            .single()

        const magicLink = magicLinkData as MagicLink | null

        if (linkError || !magicLink) {
            return NextResponse.json(
                { error: 'Invalid or expired link' },
                { status: 404 }
            )
        }

        if (!itemId || !magicLink.scope.includes(itemId)) {
            return NextResponse.json(
                { error: 'Invalid item' },
                { status: 403 }
            )
        }

        // 2. List files from storage
        const folderPath = `portal-uploads/${magicLink.deal_id}/${itemId}`

        const { data: files, error: listError } = await supabase.storage
            .from('attachments')
            .list(folderPath)

        if (listError) {
            console.error('List error:', listError)
            return NextResponse.json({ success: true, files: [] })
        }

        // 3. Get URLs for each file
        const filesWithUrls = files.map(file => {
            const { data } = supabase.storage
                .from('attachments')
                .getPublicUrl(`${folderPath}/${file.name}`)

            return {
                name: file.name,
                size: file.metadata?.size || 0,
                url: data.publicUrl,
                createdAt: file.created_at
            }
        })

        return NextResponse.json({
            success: true,
            files: filesWithUrls
        })

    } catch (error) {
        console.error('Portal files list error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
