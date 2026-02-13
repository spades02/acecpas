"use client"

import { Briefcase, Calendar, Check, DollarSign, Clock, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/ui/back-button"

// Define proper type for Deal (mirrors DealDetail in deal-view)
export interface DealHeaderProps {
    deal: {
        id: string
        name: string
        client_name: string
        deal_type: string
        status: string
        progress: number
        target_close_date: string | null
        updated_at: string
    }
}

export function DealHeader({ deal }: DealHeaderProps) {
    return (
        <div className="bg-white border-b border-border p-6 pb-4">
            <div className="flex items-center gap-2 mb-4">
                <BackButton fallbackRoute="/deals/all-deals" />
            </div>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        {deal.name}
                        <Badge variant="outline" className="text-base font-normal capitalize">{deal.status}</Badge>
                    </h1>
                    <div className="text-muted-foreground flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {deal.client_name}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Updated: {new Date(deal.updated_at).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span>All changes saved</span>
                </div>
            </div>
        </div>
    )
}
