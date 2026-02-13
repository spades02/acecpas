"use client"

import { useParams } from "next/navigation"
import { BalanceSheet } from "@/components/pages/deals/balance-sheet"

export default function BalanceSheetPage() {
    const params = useParams()
    const dealId = params?.dealId as string

    return <BalanceSheet dealId={dealId} />
}
