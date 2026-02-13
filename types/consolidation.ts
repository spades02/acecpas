export interface ConsolidatedValue {
    deal_id: string
    amount: number
}

export interface ConsolidatedLineItem {
    category: string
    subcategory: string | null
    account_name: string
    deal_values: ConsolidatedValue[]
    total_amount: number
}

export interface DealOption {
    id: string
    client_name: string
    industry?: string
}

export interface ConsolidationResponse {
    line_items: ConsolidatedLineItem[]
    deals: DealOption[]
}
