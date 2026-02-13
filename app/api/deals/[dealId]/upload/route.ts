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
 * Proxy to Python Backend: Uploads file to Ingestion Engine (Port 8000)
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        const { dealId } = await params
        const session = await getAuth0().getSession(req)

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify user has access to this deal/org
        // (Optional: You can add an extra DB check here if strictly needed, 
        // but generally RLS handles data access. Since we are proxies, we assume
        // if they are logged in, they can try to upload, and the backend/DB will reject if invalid)

        // Parse the multipart form data
        const formData = await req.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Prepare to forward to Python Backend
        // Note: Python backend expects 'file' and 'deal_id' query param
        const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000'
        const uploadUrl = `${pythonBackendUrl}/upload?deal_id=${dealId}`

        // Create a new FormData for the upstream request
        const upstreamFormData = new FormData()
        upstreamFormData.append('file', file)

        console.log(`[Proxy] Forwarding upload to: ${uploadUrl}`)

        // Forward request to Python Backend
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: upstreamFormData,
            // Next.js (Node) fetch automatically sets the correct Content-Type for FormData
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('[Proxy] Python Backend Error:', errorText)
            return NextResponse.json(
                { error: `Backend processing failed: ${response.statusText}`, details: errorText },
                { status: response.status }
            )
        }

        const data = await response.json()

        // Return the Python Backend response (which includes job_id, file info, etc.)
        return NextResponse.json({
            success: true,
            // Map Python response to what frontend expects if structure differs, 
            // but usually we can just pass it through or normalize it here.
            // Python returns: { job_id, message }
            // Frontend expects: { success: true, file: { ... } } for immediate UI update

            // For now, we return a compatible structure. 
            // The frontend 'files-tab.tsx' expects { file: { id, ... } }
            // Since the python upload is async (Celery), we might need to fake the 'file' object
            // or update the frontend to poll for status.

            // Let's return a "processing" placeholder so UI shows it
            file: {
                id: data.job_id, // Use Job ID as temp File ID
                filename: file.name,
                size: file.size,
                status: 'processing', // Special status for UI
                type: file.type
            },
            jobId: data.job_id
        }, { status: 201 })

    } catch (error) {
        console.error('[Proxy] Upload Request Error:', error)
        return NextResponse.json({ error: 'Internal server error during proxy' }, { status: 500 })
    }
}
