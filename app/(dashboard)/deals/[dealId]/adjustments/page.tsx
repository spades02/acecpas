'use client'

import { AdjustmentsTab } from "@/components/pages/deals/adjustments-tab"
import { use } from "react"

export default function AdjustmentsPage({ params }: { params: Promise<{ dealId: string }> }) {
    const { dealId } = use(params)
    return <AdjustmentsTab dealId={dealId} />
}
