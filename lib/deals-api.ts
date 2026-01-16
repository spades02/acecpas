import { createClient } from '@supabase/supabase-js'
import { Auth0Client } from '@auth0/nextjs-auth0/server'
import type { Deal as SupabaseDeal, DealStatus } from '@/types/database.types'

// Lazy initialization
let supabase: ReturnType<typeof createClient> | null = null
let auth0: Auth0Client | null = null

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabase
}

function getAuth0() {
  if (!auth0) auth0 = new Auth0Client()
  return auth0
}

// Re-export types for backwards compatibility
export type DealCategory = 'active' | 'completed' | 'archived' | 'draft'

export interface Deal {
  id: string
  name: string
  client: string
  type: string
  status: string
  progress: number
  lastUpdated: string
  createdDate: string
  targetClose: string
  dealSize: string
  industry: string
  assignedTo: string
  category: DealCategory
  completedDate?: string
  amount?: number
}

// Map database status to category
function statusToCategory(status: DealStatus): DealCategory {
  switch (status) {
    case 'active':
      return 'active'
    case 'completed':
      return 'completed'
    case 'archived':
      return 'archived'
    case 'draft':
    default:
      return 'draft'
  }
}

// Transform Supabase deal to frontend Deal type
function transformDeal(deal: SupabaseDeal & { assigned_user?: { full_name: string | null } | null }): Deal {
  return {
    id: deal.id,
    name: deal.name,
    client: deal.client_name,
    type: deal.deal_type,
    status: deal.status,
    progress: deal.progress,
    lastUpdated: new Date(deal.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    createdDate: new Date(deal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    targetClose: deal.target_close_date
      ? new Date(deal.target_close_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'TBD',
    dealSize: deal.deal_size || 'Not specified',
    industry: deal.industry || 'Not specified',
    assignedTo: deal.assigned_user?.full_name || 'Unassigned',
    category: statusToCategory(deal.status),
    completedDate: deal.completed_at
      ? new Date(deal.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : undefined
  }
}

interface GetDealsResponse {
  deals: Deal[]
  totalCount: number
}

// Get organization ID from session (for Server Components)
async function getOrganizationId(): Promise<string | null> {
  try {
    const session = await getAuth0().getSession()
    if (!session?.user) return null

    const { data } = await getSupabase()
      .from('profiles')
      .select('organization_id')
      .eq('auth0_sub', session.user.sub)
      .single()

    // Type assertion for profile data
    const profile = data as { organization_id: string } | null
    return profile?.organization_id || null
  } catch {
    return null
  }
}


/**
 * Fetch deals from Supabase
 * Called from Server Components - automatically gets org from session
 */
export async function getDeals(
  category: DealCategory | 'all' = 'all',
  pageNumber: number = 1,
  pageSize: number = 10
): Promise<GetDealsResponse> {
  const organizationId = await getOrganizationId()

  if (!organizationId) {
    console.log('No organization ID found for session')
    return { deals: [], totalCount: 0 }
  }

  const offset = (pageNumber - 1) * pageSize

  let query = getSupabase()
    .from('deals')
    .select('*, assigned_user:profiles!deals_assigned_to_fkey(full_name)', { count: 'exact' })
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (category !== 'all') {
    query = query.eq('status', category)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching deals:', error)
    return { deals: [], totalCount: 0 }
  }

  return {
    deals: (data || []).map(transformDeal),
    totalCount: count || 0
  }
}

/**
 * Get deal statistics - automatically gets org from session
 */
export async function getDealStats() {
  const organizationId = await getOrganizationId()

  if (!organizationId) {
    return { total: 0, active: 0, completed: 0, archived: 0, draft: 0 }
  }

  const { data, error } = await getSupabase()
    .from('deals')
    .select('status')
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error fetching deal stats:', error)
    return { total: 0, active: 0, completed: 0, archived: 0, draft: 0 }
  }

  // Type assertion for deals array
  const deals = (data || []) as Array<{ status: string }>

  return {
    total: deals.length,
    draft: deals.filter(d => d.status === 'draft').length,
    active: deals.filter(d => d.status === 'active').length,
    completed: deals.filter(d => d.status === 'completed').length,
    archived: deals.filter(d => d.status === 'archived').length
  }
}
