import { EBITDABridge } from "@/components/pages/deals/ebitda-bridge"

export default async function EBITDAPage({ params }: { params: Promise<{ dealId: string }> }) {
    const { dealId } = await params
    return <EBITDABridge dealId={dealId} />
}
