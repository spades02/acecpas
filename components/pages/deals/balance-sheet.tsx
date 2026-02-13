"use client"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Loader2, AlertTriangle, Download, RefreshCw, TrendingUp, TrendingDown } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { DrillDownPanel } from "@/components/drill-down/drill-down-panel"
import { ViewControls, DEFAULT_VIEW_STATE, type ViewState } from "@/components/shared/view-controls"

interface BalanceSheetProps {
    dealId: string
}

interface BSLineItem {
    category: string
    section: string
    accountType: string
    data: Record<string, number>
    total: number
    isSubtotal: boolean
    isTotalLine: boolean
    periodChanges: Record<string, { change: number; pctChange: number | null }>
}

interface BalanceSheetData {
    periods: string[]
    lineItems: BSLineItem[]
    unmapped: { count: number; amount: number }
}

interface DrillDownState {
    category: string
    period: string | null
}

interface Anomaly {
    category: string
    period: string
    type: 'spike' | 'drop' | 'new_category' | 'missing' | 'threshold'
    severity: 'low' | 'medium' | 'high'
    message: string
    value: number
    percentChange?: number
}

export function BalanceSheet({ dealId }: BalanceSheetProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<BalanceSheetData | null>(null)
    const [drillDown, setDrillDown] = useState<DrillDownState | null>(null)
    const [anomalies, setAnomalies] = useState<Anomaly[]>([])
    const [showChanges, setShowChanges] = useState(false)
    const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW_STATE)

    useEffect(() => {
        fetchData()
    }, [dealId])

    async function fetchData() {
        try {
            setLoading(true)
            const [bsRes, anomalyRes] = await Promise.all([
                fetch(`/api/balance-sheet?dealId=${dealId}`),
                fetch(`/api/anomalies?dealId=${dealId}`)
            ])
            const bsJson = await bsRes.json()
            const anomalyJson = await anomalyRes.json()

            if (bsJson.error) { toast.error(bsJson.error); return }

            setData({
                periods: bsJson.periods || [],
                lineItems: bsJson.lineItems || [],
                unmapped: bsJson.unmapped || { count: 0, amount: 0 }
            })

            if (!anomalyJson.error) {
                setAnomalies(anomalyJson.anomalies || [])
            }
        } catch (error) {
            console.error("Failed to fetch balance sheet", error)
            toast.error("Failed to load balance sheet")
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        let value = amount
        let suffix = ''
        if (viewState.rounding === 'thousands') {
            value = amount / 1000
            suffix = 'K'
        } else if (viewState.rounding === 'millions') {
            value = amount / 1000000
            suffix = 'M'
        }
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: viewState.rounding === 'actual' ? 0 : 1,
            maximumFractionDigits: viewState.rounding === 'actual' ? 0 : 1,
        }).format(value) + suffix
    }

    const anomalyMap = useMemo(() => {
        const map = new Map<string, Anomaly>()
        anomalies.forEach(a => map.set(`${a.category}|${a.period}`, a))
        return map
    }, [anomalies])

    const handleCellClick = (category: string, period: string | null) => {
        // Don't drill into subtotals
        if (['Total Assets', 'Total Liabilities', 'Total Equity', 'Total Liabilities & Equity', 'Net Working Capital'].includes(category)) return
        setDrillDown({ category, period })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <p>No data available.</p>
                <Button variant="link" onClick={fetchData}>Retry</Button>
            </div>
        )
    }

    return (
        <TooltipProvider delayDuration={200}>
            <div className="h-full flex flex-col space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Balance Sheet</h2>
                        <p className="text-sm text-muted-foreground">Monthly position snapshots · Click any cell to drill down</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={showChanges ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowChanges(!showChanges)}
                            className="text-xs"
                        >
                            {showChanges ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                            {showChanges ? 'Changes On' : 'Show Changes'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={fetchData}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* View Controls */}
                <ViewControls viewState={viewState} onChange={setViewState} />

                {/* Unmapped Warning */}
                {data.unmapped.count > 0 && (
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            <div>
                                <div className="font-medium text-amber-900">{data.unmapped.count} Unmapped BS Transactions</div>
                                <div className="text-sm text-amber-700">Totaling {formatCurrency(data.unmapped.amount)}. Not shown in grid.</div>
                            </div>
                        </div>
                        <Button size="sm" variant="outline" className="bg-white border-amber-200 text-amber-900 hover:bg-amber-100" onClick={() => router.push(`/deals/${dealId}/mapper`)}>
                            Go to Mapper
                        </Button>
                    </div>
                )}

                {/* Main Grid */}
                <Card className="flex-1 overflow-auto shadow-sm border-0">
                    <div className="relative min-w-[800px]">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50 sticky top-0 z-10 shadow-sm">
                                    <TableHead className="w-[280px] bg-muted/50 font-bold text-gray-900">Account</TableHead>
                                    <TableHead className="text-right bg-muted/50 font-bold text-gray-900 min-w-[120px] border-r">Latest</TableHead>
                                    {data.periods.map(period => (
                                        <TableHead key={period} className="text-right bg-muted/50 font-medium min-w-[120px]">{period}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.lineItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={data.periods.length + 2} className="h-32 text-center text-muted-foreground">
                                            No balance sheet data found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.lineItems.map((item) => {
                                        const isClickable = !item.isSubtotal && !item.isTotalLine
                                        const isActive = drillDown?.category === item.category

                                        return (
                                            <TableRow
                                                key={item.category}
                                                className={`
                                                    transition-colors
                                                    ${item.isTotalLine ? 'bg-gray-100 font-bold border-t-2 border-b-2 border-gray-300' : ''}
                                                    ${item.isSubtotal ? 'bg-gray-50 font-semibold border-t border-gray-200' : ''}
                                                    ${isClickable ? 'cursor-pointer hover:bg-blue-50/50' : ''}
                                                    ${isActive ? 'bg-blue-50 ring-1 ring-blue-200' : ''}
                                                `}
                                            >
                                                {/* Category */}
                                                <TableCell
                                                    className={`py-3 ${item.isSubtotal || item.isTotalLine ? 'font-bold' : 'font-medium'}`}
                                                    onClick={() => isClickable && handleCellClick(item.category, null)}
                                                >
                                                    <span className={isClickable ? 'hover:underline' : ''}>{item.category}</span>
                                                </TableCell>

                                                {/* Latest Balance */}
                                                <TableCell
                                                    className={`text-right font-semibold border-r ${item.isTotalLine ? 'text-primary' : ''}`}
                                                    onClick={() => isClickable && handleCellClick(item.category, null)}
                                                >
                                                    {formatCurrency(item.total)}
                                                </TableCell>

                                                {/* Period Columns */}
                                                {data.periods.map(period => {
                                                    const val = item.data[period]
                                                    const anomaly = anomalyMap.get(`${item.category}|${period}`)
                                                    const change = item.periodChanges?.[period]
                                                    const isActiveCell = drillDown?.category === item.category && drillDown?.period === period

                                                    const anomalyStyle = anomaly
                                                        ? anomaly.severity === 'high' ? 'bg-red-50 ring-1 ring-inset ring-red-200'
                                                            : anomaly.severity === 'medium' ? 'bg-amber-50 ring-1 ring-inset ring-amber-200'
                                                                : 'bg-yellow-50/50'
                                                        : ''

                                                    return (
                                                        <TableCell
                                                            key={period}
                                                            className={`text-right transition-colors ${anomalyStyle} ${isActiveCell ? 'bg-blue-100 font-medium text-blue-900' :
                                                                isClickable ? 'text-muted-foreground hover:bg-blue-100/50' : ''
                                                                }`}
                                                            onClick={() => isClickable && handleCellClick(item.category, period)}
                                                        >
                                                            <div>
                                                                <div className="flex items-center justify-end gap-1">
                                                                    {anomaly && (
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <AlertTriangle className={`w-3 h-3 ${anomaly.severity === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
                                                                            </TooltipTrigger>
                                                                            <TooltipContent side="top" className="max-w-[280px]">
                                                                                <p className="text-xs font-semibold mb-1">{anomaly.severity.toUpperCase()} · {anomaly.type}</p>
                                                                                <p className="text-xs">{anomaly.message}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    )}
                                                                    <span>{val !== undefined ? formatCurrency(val) : '-'}</span>
                                                                </div>
                                                                {showChanges && change && !item.isTotalLine && (
                                                                    <div className={`text-[10px] mt-0.5 font-mono ${change.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {change.change >= 0 ? '+' : ''}{formatCurrency(change.change)}
                                                                        {change.pctChange !== null && (
                                                                            <span className="ml-1 text-muted-foreground">
                                                                                ({change.pctChange >= 0 ? '+' : ''}{change.pctChange.toFixed(1)}%)
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {/* Drill-Down Panel */}
                {drillDown && (
                    <DrillDownPanel
                        dealId={dealId}
                        category={drillDown.category}
                        period={drillDown.period}
                        onClose={() => setDrillDown(null)}
                        anomalies={anomalies.filter(a =>
                            a.category === drillDown.category &&
                            (!drillDown.period || a.period === drillDown.period)
                        )}
                    />
                )}
            </div>
        </TooltipProvider>
    )
}
