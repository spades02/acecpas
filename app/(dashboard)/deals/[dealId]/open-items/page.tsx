'use client'

import { OpenItemsScreen } from "@/components/pages/deals/open-items-screen"
import { useRouter } from "next/navigation"
import { use } from "react"

export default function OpenItemsPage({ params }: { params: Promise<{ dealId: string }> }) {
    const { dealId } = use(params)
    const router = useRouter()

    return <OpenItemsScreen dealId={dealId} onNavigate={(view) => router.push(`/deals/${dealId}/${view}`)} />
}
