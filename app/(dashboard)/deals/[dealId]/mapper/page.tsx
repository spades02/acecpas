'use client'

import { MapperScreen } from "@/components/pages/deals/mapper-screen"
import { useRouter } from "next/navigation"
import { use } from "react"

export default function MapperPage({ params }: { params: Promise<{ dealId: string }> }) {
    const { dealId } = use(params)
    const router = useRouter()

    return <MapperScreen dealId={dealId} onNavigate={(view) => router.push(`/deals/${dealId}/${view}`)} />
}
