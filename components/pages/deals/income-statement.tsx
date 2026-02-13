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
import { Loader2, AlertTriangle, Download, RefreshCw, ChevronRight, Flame, TrendingDown, CircleAlert } from "lucide-react"
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

interface IncomeStatementProps {
    dealId: string
}

interface IncomeStatementData {
    periods: string[]
    lineItems: {
        category: string
        data: Record<string, number>
        total: number
    }[]
    unmapped: {
        count: number
        amount: number
    }
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

interface AnomalySummary {
    total: number
    high: number
    medium: number
    low: number
}

export function IncomeStatement({ dealId }: IncomeStatementProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<IncomeStatementData | null>(null)
    const [drillDown, setDrillDown] = useState<DrillDownState | null>(null)
    const [anomalies, setAnomalies] = useState<Anomaly[]>([])
    const [anomalySummary, setAnomalySummary] = useState<AnomalySummary>({ total: 0, high: 0, medium: 0, low: 0 })
    const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW_STATE)

    useEffect(() => {
        fetchData()
    }, [dealId])

    async function fetchData() {
        try {
            setLoading(true)

            // Fetch income statement and anomalies in parallel
            const [isRes, anomalyRes] = await Promise.all([
                fetch(`/api/income-statement?dealId=${dealId}`),
                fetch(`/api/anomalies?dealId=${dealId}`)
            ])

            const isJson = await isRes.json()
            const anomalyJson = await anomalyRes.json()

            if (isJson.error) {
                toast.error(isJson.error)
                return
            }

            setData({
                periods: isJson.periods || [],
                lineItems: isJson.lineItems || [],
                unmapped: isJson.unmapped || { count: 0, amount: 0 }
            })

            if (!anomalyJson.error) {
                setAnomalies(anomalyJson.anomalies || [])
                setAnomalySummary(anomalyJson.summary || { total: 0, high: 0, medium: 0, low: 0 })
            }
        } catch (error) {
            console.error("Failed to fetch income statement", error)
            toast.error("Failed to load income statement")
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

    // Build anomaly lookup: "category|period" -> anomaly
    const anomalyMap = useMemo(() => {
        const map = new Map<string, Anomaly>()
        anomalies.forEach(a => {
            map.set(`${a.category}|${a.period}`, a)
        })
        return map
    }, [anomalies])

    // Count anomalies per category (for row-level indicators)
    const categoryAnomalyCount = useMemo(() => {
        const counts = new Map<string, { high: number, medium: number, low: number }>()
        anomalies.forEach(a => {
            if (!counts.has(a.category)) counts.set(a.category, { high: 0, medium: 0, low: 0 })
            const c = counts.get(a.category)!
            c[a.severity]++
        })
        return counts
    }, [anomalies])

    const handleCellClick = (category: string, period: string | null) => {
        setDrillDown({ category, period })
    }

    const getAnomalyIndicator = (anomaly: Anomaly) => {
        const colors = {
            high: 'text-red-500',
            medium: 'text-amber-500',
            low: 'text-yellow-400'
        }
        const icons = {
            spike: <Flame className={`w-3.5 h-3.5 ${colors[anomaly.severity]}`} />,
            drop: <TrendingDown className={`w-3.5 h-3.5 ${colors[anomaly.severity]}`} />,
            missing: <CircleAlert className={`w-3.5 h-3.5 ${colors[anomaly.severity]}`} />,
            new_category: <CircleAlert className={`w-3.5 h-3.5 ${colors[anomaly.severity]}`} />,
            threshold: <AlertTriangle className={`w-3.5 h-3.5 ${colors[anomaly.severity]}`} />
        }
        return icons[anomaly.type] || icons.threshold
    }

    const getCellAnomalyStyle = (anomaly: Anomaly | undefined) => {
        if (!anomaly) return ''
        const styles = {
            high: 'bg-red-50 ring-1 ring-inset ring-red-200',
            medium: 'bg-amber-50 ring-1 ring-inset ring-amber-200',
            low: 'bg-yellow-50/50'
        }
        return styles[anomaly.severity] || ''
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
                {/* Header / Toolbar */}
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Income Statement</h2>
                        <p className="text-sm text-muted-foreground">Monthly P&L View · Click any cell to drill down</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Anomaly Summary Badges */}
                        {anomalySummary.total > 0 && (
                            <div className="flex items-center gap-1.5 mr-2 px-3 py-1.5 bg-slate-50 border rounded-lg">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                <span className="text-xs font-medium text-muted-foreground">Anomalies:</span>
                                {anomalySummary.high > 0 && (
                                    <Badge className="bg-red-100 text-red-800 border-red-200 text-[10px] px-1.5">{anomalySummary.high} High</Badge>
                                )}
                                {anomalySummary.medium > 0 && (
                                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] px-1.5">{anomalySummary.medium} Med</Badge>
                                )}
                                {anomalySummary.low > 0 && (
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-[10px] px-1.5">{anomalySummary.low} Low</Badge>
                                )}
                            </div>
                        )}
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
                                <div className="font-medium text-amber-900">
                                    {data.unmapped.count} Unmapped Transactions
                                </div>
                                <div className="text-sm text-amber-700">
                                    Totaling {formatCurrency(data.unmapped.amount)}. These are categorized as "Unmapped" below.
                                </div>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-white border-amber-200 text-amber-900 hover:bg-amber-100"
                            onClick={() => router.push(`/deals/${dealId}/mapper`)}
                        >
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
                                    <TableHead className="w-[300px] bg-muted/50 font-bold text-gray-900">Category</TableHead>
                                    <TableHead className="text-right bg-muted/50 font-bold text-gray-900 min-w-[120px] border-r">Total</TableHead>
                                    {data.periods.map(period => (
                                        <TableHead key={period} className="text-right bg-muted/50 font-medium min-w-[120px]">
                                            {period}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.lineItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={data.periods.length + 2} className="h-32 text-center text-muted-foreground">
                                            No transactions found for this period.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.lineItems.map((item) => {
                                        const isTotalRow = item.category === 'Net Income' || item.category === 'Gross Profit' || item.category === 'EBITDA'
                                        const isUnmapped = item.category === 'Unmapped'
                                        const isActive = drillDown?.category === item.category
                                        const catAnomalies = categoryAnomalyCount.get(item.category)

                                        return (
                                            <TableRow
                                                key={item.category}
                                                className={`
                                                    cursor-pointer transition-colors
                                                    ${isTotalRow ? 'bg-gray-50 font-bold border-t-2 border-gray-200' : 'hover:bg-blue-50/50'}
                                                    ${isUnmapped ? 'bg-red-50/50 hover:bg-red-50' : ''}
                                                    ${isActive ? 'bg-blue-50 ring-1 ring-blue-200' : ''}
                                                `}
                                            >
                                                {/* Category Name */}
                                                <TableCell
                                                    className="font-medium py-3"
                                                    onClick={() => handleCellClick(item.category, null)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {isUnmapped && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                                        <span className="hover:underline">{item.category}</span>
                                                        {catAnomalies && (catAnomalies.high > 0 || catAnomalies.medium > 0) && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className="flex items-center gap-0.5">
                                                                        <AlertTriangle className={`w-3.5 h-3.5 ${catAnomalies.high > 0 ? 'text-red-500' : 'text-amber-500'}`} />
                                                                        <span className="text-[10px] text-muted-foreground font-normal">
                                                                            {(catAnomalies.high || 0) + (catAnomalies.medium || 0)}
                                                                        </span>
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="right" className="max-w-[280px]">
                                                                    <p className="text-xs font-medium mb-1">{item.category} Anomalies</p>
                                                                    {catAnomalies.high > 0 && <p className="text-xs text-red-600">{catAnomalies.high} high severity</p>}
                                                                    {catAnomalies.medium > 0 && <p className="text-xs text-amber-600">{catAnomalies.medium} medium severity</p>}
                                                                    {catAnomalies.low > 0 && <p className="text-xs text-yellow-600">{catAnomalies.low} low severity</p>}
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Total Column */}
                                                <TableCell
                                                    className={`text-right font-semibold border-r hover:bg-blue-100/50 transition-colors ${isUnmapped ? 'text-red-700' : ''}`}
                                                    onClick={() => handleCellClick(item.category, null)}
                                                >
                                                    {formatCurrency(item.total)}
                                                </TableCell>

                                                {/* Period Columns with anomaly highlighting */}
                                                {data.periods.map(period => {
                                                    const anomaly = anomalyMap.get(`${item.category}|${period}`)
                                                    const cellStyle = getCellAnomalyStyle(anomaly)
                                                    const isActiveCell = drillDown?.category === item.category && drillDown?.period === period

                                                    return (
                                                        <TableCell
                                                            key={period}
                                                            className={`text-right transition-colors relative ${cellStyle} ${isActiveCell ? 'bg-blue-100 font-medium text-blue-900' : 'text-muted-foreground hover:bg-blue-100/50'
                                                                }`}
                                                            onClick={() => handleCellClick(item.category, period)}
                                                        >
                                                            <div className="flex items-center justify-end gap-1">
                                                                {anomaly && (
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <span className="cursor-pointer">
                                                                                {getAnomalyIndicator(anomaly)}
                                                                            </span>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent side="top" className="max-w-[300px]">
                                                                            <div className="text-xs">
                                                                                <p className="font-semibold mb-1 flex items-center gap-1">
                                                                                    <span className={`inline-block w-2 h-2 rounded-full ${anomaly.severity === 'high' ? 'bg-red-500' : anomaly.severity === 'medium' ? 'bg-amber-500' : 'bg-yellow-400'
                                                                                        }`} />
                                                                                    {anomaly.severity.toUpperCase()} · {anomaly.type.replace('_', ' ')}
                                                                                </p>
                                                                                <p>{anomaly.message}</p>
                                                                            </div>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                )}
                                                                <span>{item.data[period] ? formatCurrency(item.data[period]) : '-'}</span>
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

                {/* Drill-Down Panel (Slide-out) */}
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
