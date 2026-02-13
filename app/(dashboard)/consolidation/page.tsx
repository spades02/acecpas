"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Layers, Download, RefreshCw, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { DealSelector, DealOption } from "@/components/shared/deal-selector"
import { ConsolidationResponse, ConsolidatedLineItem } from "@/types/consolidation"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export default function ConsolidationPage() {
    const [deals, setDeals] = useState<DealOption[]>([])
    const [selectedDealIds, setSelectedDealIds] = useState<string[]>([])

    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<ConsolidationResponse | null>(null)

    // Fetch available deals on mount
    useEffect(() => {
        fetch('/api/deals') // Assuming we have this endpoint or similar
            .then(res => res.json())
            .then(json => {
                if (json.deals) setDeals(json.deals)
                else if (Array.isArray(json)) setDeals(json)
            })
            .catch(err => console.error("Failed to fetch deals", err))
    }, [])

    const handleGenerate = async () => {
        if (selectedDealIds.length === 0) {
            toast.error("Please select at least one deal")
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/consolidation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deal_ids: selectedDealIds })
            })

            const json = await res.json()
            if (json.error) throw new Error(json.error)

            setData(json)
            toast.success("Consolidation generated successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to generate consolidation")
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(val)

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Layers className="w-6 h-6" />
                        Multi-Entity Consolidation
                    </h1>
                    <p className="text-muted-foreground">Aggregate P&L across multiple entities/deals.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleGenerate} disabled={loading || selectedDealIds.length === 0}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button variant="outline" disabled={!data}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Excel
                    </Button>
                </div>
            </div>

            {/* Controls */}
            <Card className="p-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Select Entities:</span>
                    <DealSelector
                        deals={deals}
                        selectedIds={selectedDealIds}
                        onChange={setSelectedDealIds}
                    />
                </div>
                <div className="h-8 w-px bg-border" />
                <Button onClick={handleGenerate} disabled={loading || selectedDealIds.length === 0}>
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Layers className="w-4 h-4 mr-2" />}
                    Generate Consolidation
                </Button>
            </Card>

            {/* Results Grid */}
            {data ? (
                <Card className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[300px]">Account</TableHead>
                                <TableHead>Category</TableHead>
                                {data.deals.map(deal => (
                                    <TableHead key={deal.id} className="text-right min-w-[120px]">
                                        {deal.client_name}
                                    </TableHead>
                                ))}
                                <TableHead className="text-right font-bold bg-muted/50">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.line_items.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3 + data.deals.length} className="text-center h-32 text-muted-foreground">
                                        No data found for selected deals.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                // Group by Category
                                Object.entries(groupBy(data.line_items, 'category')).map(([category, items]) => (
                                    <>
                                        <TableRow key={category} className="bg-muted/30 font-semibold">
                                            <TableCell colSpan={2}>{category}</TableCell>
                                            <TableCell colSpan={data.deals.length + 1} />
                                        </TableRow>
                                        {items.map((item, idx) => (
                                            <TableRow key={`${item.account_name}-${idx}`}>
                                                <TableCell className="pl-8 font-medium">{item.account_name}</TableCell>
                                                <TableCell className="text-muted-foreground text-xs">{item.subcategory || '-'}</TableCell>

                                                {/* Deal Columns */}
                                                {data.deals.map(deal => {
                                                    const val = item.deal_values.find(v => v.deal_id === deal.id)?.amount || 0
                                                    return (
                                                        <TableCell key={deal.id} className="text-right font-mono">
                                                            {val === 0 ? '-' : formatCurrency(val)}
                                                        </TableCell>
                                                    )
                                                })}

                                                {/* Total Column */}
                                                <TableCell className="text-right font-bold font-mono bg-muted/20">
                                                    {formatCurrency(item.total_amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                    <Layers className="w-12 h-12 mb-4 opacity-50" />
                    <p className="font-medium">No consolidation generated</p>
                    <p className="text-sm">Select deals and click Generate to view aggregated P&L.</p>
                </div>
            )}
        </div>
    )
}

// Helper
function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((result: Record<string, T[]>, currentValue) => {
        const groupKey = String(currentValue[key]);
        (result[groupKey] = result[groupKey] || []).push(currentValue);
        return result;
    }, {});
}
