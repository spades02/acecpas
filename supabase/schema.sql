-- ============================================================================
-- AceCPAs Database Schema
-- Supabase PostgreSQL Schema for Financial Intelligence Platform MVP
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE file_status AS ENUM ('pending', 'uploading', 'processing', 'completed', 'failed');
CREATE TYPE deal_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE approval_status AS ENUM ('green', 'yellow', 'red');
CREATE TYPE anomaly_type AS ENUM ('keyword_match', 'trend_outlier', 'missing_data', 'duplicate', 'threshold_breach');
CREATE TYPE open_item_status AS ENUM ('pending', 'sent', 'responded', 'resolved');
CREATE TYPE artifact_type AS ENUM ('databook', 'mapping_export', 'anomaly_report', 'open_items_summary');

-- ============================================================================
-- MODULE 1: CORE INFRASTRUCTURE
-- ============================================================================

-- Organizations (Multi-tenant root entity)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subscription_tier TEXT DEFAULT 'free',
    billing_email TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (User profiles linked to Auth0)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth0_sub TEXT UNIQUE NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'member',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals (Central entity for all data)
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    deal_type TEXT NOT NULL,
    industry TEXT,
    deal_size TEXT,
    status deal_status DEFAULT 'draft',
    progress SMALLINT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    target_close_date DATE,
    description TEXT,
    assigned_to UUID REFERENCES profiles(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================================================
-- MODULE 2: INGESTION ENGINE
-- ============================================================================

-- Files (Uploaded documents)
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    storage_path TEXT NOT NULL,
    status file_status DEFAULT 'pending',
    error_message TEXT,
    uploaded_by UUID REFERENCES profiles(id),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GL Transactions (Raw client data)
CREATE TABLE gl_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    file_id UUID REFERENCES files(id) ON DELETE SET NULL,
    transaction_date DATE,
    account_number TEXT,
    account_name TEXT,
    description TEXT,
    vendor_name TEXT,
    amount DECIMAL(19, 4) NOT NULL,
    debit_credit TEXT,
    original_data JSONB,
    row_number INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MODULE 3: MAPPER AGENT (Vector-Based)
-- ============================================================================

-- Master Chart of Accounts (Global reference)
CREATE TABLE master_coa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_code TEXT UNIQUE NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL,
    category TEXT,
    subcategory TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client Accounts (Unique account strings with embeddings)
CREATE TABLE client_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    original_account_string TEXT NOT NULL,
    account_number TEXT,
    account_name TEXT,
    vendor_name TEXT,
    description TEXT,
    embedding VECTOR(1536),
    transaction_count INTEGER DEFAULT 0,
    total_amount DECIMAL(19, 4) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(deal_id, original_account_string)
);

-- Account Mappings (AI suggestions with approval status)
CREATE TABLE account_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    client_account_id UUID NOT NULL REFERENCES client_accounts(id) ON DELETE CASCADE,
    master_account_id UUID REFERENCES master_coa(id) ON DELETE SET NULL,
    confidence_score SMALLINT CHECK (confidence_score >= 0 AND confidence_score <= 100),
    approval_status approval_status DEFAULT 'yellow',
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    ai_reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MODULE 4: AUDITOR AGENT
-- ============================================================================

-- Anomalies (Detected issues)
CREATE TABLE anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES gl_transactions(id) ON DELETE SET NULL,
    anomaly_type anomaly_type NOT NULL,
    severity SMALLINT DEFAULT 5 CHECK (severity >= 1 AND severity <= 10),
    title TEXT NOT NULL,
    description TEXT,
    detected_value TEXT,
    expected_value TEXT,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Open Items (AI-generated questions)
CREATE TABLE open_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    anomaly_id UUID REFERENCES anomalies(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    context TEXT,
    priority SMALLINT DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    status open_item_status DEFAULT 'pending',
    client_response TEXT,
    responded_at TIMESTAMPTZ,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Magic Links (Secure external access)
CREATE TABLE magic_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
    scope UUID[] NOT NULL, -- Array of open_item_ids
    expires_at TIMESTAMPTZ NOT NULL,
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMPTZ,
    client_email TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MODULE 5: REPORTING
-- ============================================================================

-- Databook Artifacts (Generated reports)
CREATE TABLE databook_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    artifact_type artifact_type NOT NULL,
    filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size BIGINT,
    generated_by UUID REFERENCES profiles(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Core lookups
CREATE INDEX idx_profiles_auth0_sub ON profiles(auth0_sub);
CREATE INDEX idx_profiles_organization ON profiles(organization_id);
CREATE INDEX idx_deals_organization ON deals(organization_id);
CREATE INDEX idx_deals_status ON deals(status);

-- File/Transaction lookups
CREATE INDEX idx_files_deal ON files(deal_id);
CREATE INDEX idx_files_status ON files(status);
CREATE INDEX idx_gl_transactions_deal ON gl_transactions(deal_id);
CREATE INDEX idx_gl_transactions_file ON gl_transactions(file_id);

-- Mapping lookups
CREATE INDEX idx_client_accounts_deal ON client_accounts(deal_id);
CREATE INDEX idx_account_mappings_deal ON account_mappings(deal_id);
CREATE INDEX idx_account_mappings_client_account ON account_mappings(client_account_id);

-- Vector similarity search
CREATE INDEX idx_client_accounts_embedding ON client_accounts USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Auditor lookups
CREATE INDEX idx_anomalies_deal ON anomalies(deal_id);
CREATE INDEX idx_open_items_deal ON open_items(deal_id);
CREATE INDEX idx_magic_links_token ON magic_links(token);
CREATE INDEX idx_magic_links_expires ON magic_links(expires_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE gl_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_coa ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE open_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE databook_artifacts ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view own organization" ON organizations
    FOR SELECT USING (
        id IN (SELECT organization_id FROM profiles WHERE auth0_sub = auth.jwt()->>'sub')
    );

-- Profiles: Users can view profiles in their organization
CREATE POLICY "Users can view organization profiles" ON profiles
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE auth0_sub = auth.jwt()->>'sub')
    );

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth0_sub = auth.jwt()->>'sub');

-- Deals: Full CRUD for organization members
CREATE POLICY "Users can view organization deals" ON deals
    FOR SELECT USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE auth0_sub = auth.jwt()->>'sub')
    );

CREATE POLICY "Users can create deals in organization" ON deals
    FOR INSERT WITH CHECK (
        organization_id IN (SELECT organization_id FROM profiles WHERE auth0_sub = auth.jwt()->>'sub')
    );

CREATE POLICY "Users can update organization deals" ON deals
    FOR UPDATE USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE auth0_sub = auth.jwt()->>'sub')
    );

CREATE POLICY "Users can delete organization deals" ON deals
    FOR DELETE USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE auth0_sub = auth.jwt()->>'sub')
    );

-- Files: Organization-scoped access
CREATE POLICY "Users can manage organization files" ON files
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE auth0_sub = auth.jwt()->>'sub')
    );

-- GL Transactions: Organization-scoped access
CREATE POLICY "Users can manage organization transactions" ON gl_transactions
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE auth0_sub = auth.jwt()->>'sub')
    );

-- Master COA: Read-only for all authenticated users
CREATE POLICY "Authenticated users can view master COA" ON master_coa
    FOR SELECT USING (auth.role() = 'authenticated');

-- Client Accounts: Organization-scoped access
CREATE POLICY "Users can manage organization client accounts" ON client_accounts
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE auth0_sub = auth.jwt()->>'sub')
    );

-- Account Mappings: Organization-scoped access
CREATE POLICY "Users can manage organization mappings" ON account_mappings
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE auth0_sub = auth.jwt()->>'sub')
    );

-- Anomalies: Organization-scoped access
CREATE POLICY "Users can manage organization anomalies" ON anomalies
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE auth0_sub = auth.jwt()->>'sub')
    );

-- Open Items: Organization-scoped access
CREATE POLICY "Users can manage organization open items" ON open_items
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE auth0_sub = auth.jwt()->>'sub')
    );

-- Magic Links: Organization-scoped + token-based access
CREATE POLICY "Users can manage organization magic links" ON magic_links
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE auth0_sub = auth.jwt()->>'sub')
    );

-- Databook Artifacts: Organization-scoped access
CREATE POLICY "Users can manage organization artifacts" ON databook_artifacts
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE auth0_sub = auth.jwt()->>'sub')
    );

-- ============================================================================
-- SERVICE ROLE BYPASS POLICIES
-- These allow the service role to bypass RLS for admin operations
-- ============================================================================

CREATE POLICY "Service role full access to organizations" ON organizations
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to profiles" ON profiles
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role full access to deals" ON deals
    FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- TRIGGERS FOR updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_accounts_updated_at BEFORE UPDATE ON client_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_mappings_updated_at BEFORE UPDATE ON account_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_open_items_updated_at BEFORE UPDATE ON open_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: Master Chart of Accounts
-- ============================================================================

INSERT INTO master_coa (account_code, account_name, account_type, category, subcategory, display_order) VALUES
-- Assets
('1000', 'Cash and Cash Equivalents', 'Asset', 'Current Assets', 'Cash', 1),
('1100', 'Accounts Receivable', 'Asset', 'Current Assets', 'Receivables', 2),
('1200', 'Inventory', 'Asset', 'Current Assets', 'Inventory', 3),
('1300', 'Prepaid Expenses', 'Asset', 'Current Assets', 'Prepaid', 4),
('1500', 'Property, Plant & Equipment', 'Asset', 'Fixed Assets', 'PP&E', 5),
('1600', 'Accumulated Depreciation', 'Asset', 'Fixed Assets', 'Contra', 6),
('1700', 'Intangible Assets', 'Asset', 'Non-Current Assets', 'Intangibles', 7),
-- Liabilities
('2000', 'Accounts Payable', 'Liability', 'Current Liabilities', 'Payables', 10),
('2100', 'Accrued Expenses', 'Liability', 'Current Liabilities', 'Accruals', 11),
('2200', 'Short-term Debt', 'Liability', 'Current Liabilities', 'Debt', 12),
('2500', 'Long-term Debt', 'Liability', 'Non-Current Liabilities', 'Debt', 13),
('2600', 'Deferred Tax Liability', 'Liability', 'Non-Current Liabilities', 'Tax', 14),
-- Equity
('3000', 'Common Stock', 'Equity', 'Equity', 'Capital Stock', 20),
('3100', 'Retained Earnings', 'Equity', 'Equity', 'Retained Earnings', 21),
('3200', 'Additional Paid-in Capital', 'Equity', 'Equity', 'APIC', 22),
-- Revenue
('4000', 'Revenue', 'Revenue', 'Operating Revenue', 'Sales', 30),
('4100', 'Service Revenue', 'Revenue', 'Operating Revenue', 'Services', 31),
('4500', 'Other Income', 'Revenue', 'Non-Operating Revenue', 'Other', 32),
-- Expenses
('5000', 'Cost of Goods Sold', 'Expense', 'Cost of Sales', 'COGS', 40),
('6000', 'Salaries and Wages', 'Expense', 'Operating Expenses', 'Payroll', 50),
('6100', 'Employee Benefits', 'Expense', 'Operating Expenses', 'Payroll', 51),
('6200', 'Rent Expense', 'Expense', 'Operating Expenses', 'Occupancy', 52),
('6300', 'Utilities', 'Expense', 'Operating Expenses', 'Occupancy', 53),
('6400', 'Depreciation Expense', 'Expense', 'Operating Expenses', 'Depreciation', 54),
('6500', 'Professional Services', 'Expense', 'Operating Expenses', 'Services', 55),
('6600', 'Marketing and Advertising', 'Expense', 'Operating Expenses', 'Marketing', 56),
('6700', 'Travel and Entertainment', 'Expense', 'Operating Expenses', 'T&E', 57),
('6800', 'Insurance', 'Expense', 'Operating Expenses', 'Insurance', 58),
('7000', 'Interest Expense', 'Expense', 'Non-Operating Expenses', 'Finance', 60),
('7100', 'Income Tax Expense', 'Expense', 'Tax Expense', 'Tax', 70);
