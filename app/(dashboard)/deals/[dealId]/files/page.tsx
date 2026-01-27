'use client'

import { FilesTab } from "@/components/pages/deals/files-tab"
import { useRouter } from "next/navigation"
import { use } from "react"

export default function FilesPage({ params }: { params: Promise<{ dealId: string }> }) {
    const { dealId } = use(params)
    const router = useRouter()

    return <FilesTab dealId={dealId} onNavigate={(view) => router.push(`/deals/${dealId}/${view}`)} />
}
