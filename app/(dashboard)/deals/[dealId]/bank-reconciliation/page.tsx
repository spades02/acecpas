"use client"

import { useParams } from "next/navigation"
import { BankReconciliation } from "@/components/pages/deals/bank-reconciliation"

export default function BankReconciliationPage() {
    const params = useParams()
    const dealId = params?.dealId as string

    return <BankReconciliation dealId={dealId} />
}
