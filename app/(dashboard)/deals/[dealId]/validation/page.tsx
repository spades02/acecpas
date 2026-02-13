"use client"

import { useParams } from "next/navigation"
import { ValidationPanel } from "@/components/pages/deals/validation-panel"

export default function ValidationPage() {
    const params = useParams()
    const dealId = params?.dealId as string

    return <ValidationPanel dealId={dealId} />
}
