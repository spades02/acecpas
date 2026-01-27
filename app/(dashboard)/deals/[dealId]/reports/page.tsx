'use client'

import { ReportsScreen } from "@/components/pages/deals/reports-screen"
import { useRouter } from "next/navigation"
import { use } from "react"

export default function ReportsPage({ params }: { params: Promise<{ dealId: string }> }) {
    const { dealId } = use(params)
    const router = useRouter()

    return <ReportsScreen dealId={dealId} onNavigate={(view) => router.push(`/deals/${dealId}/${view}`)} />
}
