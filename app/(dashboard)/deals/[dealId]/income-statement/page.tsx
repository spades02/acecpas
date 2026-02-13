'use client'

import { IncomeStatement } from "@/components/pages/deals/income-statement"
import { use } from "react"

export default function IncomeStatementPage({ params }: { params: Promise<{ dealId: string }> }) {
    const { dealId } = use(params)
    return <IncomeStatement dealId={dealId} />
}
