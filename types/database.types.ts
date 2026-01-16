/**
 * AceCPAs Database Types
 * Auto-generated types matching the Supabase PostgreSQL schema
 * 
 * Usage:
 *   import type { Database, Tables, Enums } from '@/types/database.types'
 *   const deal: Tables<'deals'> = ...
 */

// ============================================================================
// ENUMS
// ============================================================================

export type FileStatus = 'pending' | 'uploading' | 'processing' | 'completed' | 'failed'
export type DealStatus = 'draft' | 'active' | 'completed' | 'archived'
export type ApprovalStatus = 'green' | 'yellow' | 'red'
export type AnomalyType = 'keyword_match' | 'trend_outlier' | 'missing_data' | 'duplicate' | 'threshold_breach'
export type OpenItemStatus = 'pending' | 'sent' | 'responded' | 'resolved'
export type ArtifactType = 'databook' | 'mapping_export' | 'anomaly_report' | 'open_items_summary'

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface Organization {
    id: string
    name: string
    slug: string
    subscription_tier: string | null
    billing_email: string | null
    settings: Record<string, unknown> | null
    created_at: string
    updated_at: string
}

export interface Profile {
    id: string
    auth0_sub: string
    organization_id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    role: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Deal {
    id: string
    organization_id: string
    name: string
    client_name: string
    deal_type: string
    industry: string | null
    deal_size: string | null
    status: DealStatus
    progress: number
    target_close_date: string | null
    description: string | null
    assigned_to: string | null
    created_by: string | null
    created_at: string
    updated_at: string
    completed_at: string | null
}

export interface File {
    id: string
    deal_id: string
    organization_id: string
    filename: string
    original_filename: string
    file_type: string | null
    file_size: number | null
    storage_path: string
    status: FileStatus
    error_message: string | null
    uploaded_by: string | null
    processed_at: string | null
    created_at: string
    updated_at: string
}

export interface GLTransaction {
    id: string
    deal_id: string
    organization_id: string
    file_id: string | null
    transaction_date: string | null
    account_number: string | null
    account_name: string | null
    description: string | null
    vendor_name: string | null
    amount: number
    debit_credit: string | null
    original_data: Record<string, unknown> | null
    row_number: number | null
    created_at: string
}

export interface MasterAccount {
    id: string
    account_code: string
    account_name: string
    account_type: string
    category: string | null
    subcategory: string | null
    description: string | null
    is_active: boolean
    display_order: number | null
    created_at: string
    updated_at: string
}

export interface ClientAccount {
    id: string
    deal_id: string
    organization_id: string
    original_account_string: string
    account_number: string | null
    account_name: string | null
    vendor_name: string | null
    description: string | null
    embedding: number[] | null  // pgvector - 1536 dimensions
    transaction_count: number
    total_amount: number
    created_at: string
    updated_at: string
}

export interface AccountMapping {
    id: string
    deal_id: string
    organization_id: string
    client_account_id: string
    master_account_id: string | null
    confidence_score: number
    approval_status: ApprovalStatus
    approved_by: string | null
    approved_at: string | null
    ai_reasoning: string | null
    created_at: string
    updated_at: string
}

export interface Anomaly {
    id: string
    deal_id: string
    organization_id: string
    transaction_id: string | null
    anomaly_type: AnomalyType
    severity: number
    title: string
    description: string | null
    detected_value: string | null
    expected_value: string | null
    is_resolved: boolean
    resolved_by: string | null
    resolved_at: string | null
    resolution_notes: string | null
    created_at: string
}

export interface OpenItem {
    id: string
    deal_id: string
    organization_id: string
    anomaly_id: string | null
    question: string
    context: string | null
    priority: number
    status: OpenItemStatus
    client_response: string | null
    responded_at: string | null
    is_resolved: boolean
    resolved_by: string | null
    resolved_at: string | null
    created_at: string
    updated_at: string
}

export interface MagicLink {
    id: string
    deal_id: string
    organization_id: string
    token: string
    scope: string[]  // Array of open_item_ids
    expires_at: string
    is_used: boolean
    used_at: string | null
    client_email: string | null
    created_by: string | null
    created_at: string
}

export interface DatabookArtifact {
    id: string
    deal_id: string
    organization_id: string
    artifact_type: ArtifactType
    filename: string
    storage_path: string
    file_size: number | null
    generated_by: string | null
    metadata: Record<string, unknown> | null
    created_at: string
}

// ============================================================================
// DATABASE SCHEMA TYPE
// ============================================================================

export interface Database {
    public: {
        Tables: {
            organizations: {
                Row: Organization
                Insert: Omit<Organization, 'id' | 'created_at' | 'updated_at'> & {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Omit<Organization, 'id' | 'created_at'>>
            }
            profiles: {
                Row: Profile
                Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Omit<Profile, 'id' | 'created_at'>>
            }
            deals: {
                Row: Deal
                Insert: Omit<Deal, 'id' | 'created_at' | 'updated_at' | 'progress'> & {
                    id?: string
                    created_at?: string
                    updated_at?: string
                    progress?: number
                }
                Update: Partial<Omit<Deal, 'id' | 'created_at'>>
            }
            files: {
                Row: File
                Insert: Omit<File, 'id' | 'created_at' | 'updated_at'> & {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Omit<File, 'id' | 'created_at'>>
            }
            gl_transactions: {
                Row: GLTransaction
                Insert: Omit<GLTransaction, 'id' | 'created_at'> & {
                    id?: string
                    created_at?: string
                }
                Update: Partial<Omit<GLTransaction, 'id' | 'created_at'>>
            }
            master_coa: {
                Row: MasterAccount
                Insert: Omit<MasterAccount, 'id' | 'created_at' | 'updated_at'> & {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Omit<MasterAccount, 'id' | 'created_at'>>
            }
            client_accounts: {
                Row: ClientAccount
                Insert: Omit<ClientAccount, 'id' | 'created_at' | 'updated_at'> & {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Omit<ClientAccount, 'id' | 'created_at'>>
            }
            account_mappings: {
                Row: AccountMapping
                Insert: Omit<AccountMapping, 'id' | 'created_at' | 'updated_at'> & {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Omit<AccountMapping, 'id' | 'created_at'>>
            }
            anomalies: {
                Row: Anomaly
                Insert: Omit<Anomaly, 'id' | 'created_at'> & {
                    id?: string
                    created_at?: string
                }
                Update: Partial<Omit<Anomaly, 'id' | 'created_at'>>
            }
            open_items: {
                Row: OpenItem
                Insert: Omit<OpenItem, 'id' | 'created_at' | 'updated_at'> & {
                    id?: string
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Omit<OpenItem, 'id' | 'created_at'>>
            }
            magic_links: {
                Row: MagicLink
                Insert: Omit<MagicLink, 'id' | 'created_at'> & {
                    id?: string
                    created_at?: string
                }
                Update: Partial<Omit<MagicLink, 'id' | 'created_at'>>
            }
            databook_artifacts: {
                Row: DatabookArtifact
                Insert: Omit<DatabookArtifact, 'id' | 'created_at'> & {
                    id?: string
                    created_at?: string
                }
                Update: Partial<Omit<DatabookArtifact, 'id' | 'created_at'>>
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            file_status: FileStatus
            deal_status: DealStatus
            approval_status: ApprovalStatus
            anomaly_type: AnomalyType
            open_item_status: OpenItemStatus
            artifact_type: ArtifactType
        }
    }
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Extract row type from a table name
 * @example Tables<'deals'> => Deal
 */
export type Tables<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Row']

/**
 * Extract insert type from a table name
 * @example TablesInsert<'deals'> => InsertDeal
 */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Insert']

/**
 * Extract update type from a table name
 * @example TablesUpdate<'deals'> => UpdateDeal
 */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
    Database['public']['Tables'][T]['Update']

/**
 * Extract enum type from an enum name
 * @example Enums<'deal_status'> => DealStatus
 */
export type Enums<T extends keyof Database['public']['Enums']> =
    Database['public']['Enums'][T]
