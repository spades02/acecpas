import { NextRequest, NextResponse } from 'next/server'
import { Auth0Client } from '@auth0/nextjs-auth0/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time errors
let auth0client: Auth0Client | null = null
let supabaseAdmin: SupabaseClient | null = null

function getAuth0Client() {
    if (!auth0client) {
        auth0client = new Auth0Client()
    }
    return auth0client
}

function getSupabaseAdmin() {
    if (!supabaseAdmin) {
        supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )
    }
    return supabaseAdmin
}

/**
 * POST /api/auth/sync
 * Syncs Auth0 user to Supabase profiles table
 * Called after successful Auth0 login (backup sync mechanism)
 */
export async function POST(req: NextRequest) {
    try {
        const auth0 = getAuth0Client()
        const session = await auth0.getSession(req)

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const { user } = session
        const auth0Sub = user.sub
        const supabase = getSupabaseAdmin()

        // Check if profile already exists
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, organization_id, full_name, avatar_url')
            .eq('auth0_sub', auth0Sub)
            .single()

        if (existingProfile) {
            // Check if we need to update the profile with latest Auth0 data
            const updates: any = {}

            // Only update name if it's strictly better (e.g. not an email)
            const auth0Name = user.name;
            const isEmailName = auth0Name && (auth0Name.includes('@') || auth0Name === user.email);

            if (auth0Name && !isEmailName && auth0Name !== existingProfile.full_name) {
                updates.full_name = auth0Name
            }
            if (user.picture && user.picture !== existingProfile.avatar_url) {
                updates.avatar_url = user.picture
            }

            if (Object.keys(updates).length > 0) {
                await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', existingProfile.id)

                // Return updated profile
                return NextResponse.json({
                    success: true,
                    profile: { ...existingProfile, ...updates },
                    isNewUser: false
                })
            }

            return NextResponse.json({
                success: true,
                profile: existingProfile,
                isNewUser: false
            })
        }

        // New user - create organization and profile
        // Heuristic: If name looks like email, fallback to 'User's Organization'
        const orgNameBase = (user.name && !user.name.includes('@')) ? user.name : 'User';

        const { data: newOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name: `${orgNameBase}'s Organization`,
                slug: `org-${Date.now()}`,
                subscription_tier: 'free'
            })
            .select('id')
            .single()

        if (orgError || !newOrg) {
            console.error('Error creating organization:', orgError)
            return NextResponse.json(
                { error: 'Failed to create organization' },
                { status: 500 }
            )
        }

        const { data: newProfile, error: profileError } = await supabase
            .from('profiles')
            .insert({
                auth0_sub: auth0Sub,
                organization_id: newOrg.id,
                email: user.email || '',
                // Don't use name if it looks like an email or matches email exactly
                full_name: (user.name && !user.name.includes('@') && user.name !== user.email) ? user.name : null,
                avatar_url: user.picture || null,
                role: 'owner',
                is_active: true
            })
            .select('id, organization_id')
            .single()

        if (profileError) {
            console.error('Error creating profile:', profileError)
            return NextResponse.json(
                { error: 'Failed to create profile' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            profile: newProfile,
            isNewUser: true
        })

    } catch (error) {
        console.error('Sync error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
