"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, BarChart3, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { toast } from "sonner"

interface BridgeStep {
    label: string
    value: number
    running_total: number
    step_type: "total" | "addition" | "subtraction"
    category: string | null
}

interface EBITDAData {
    deal_id: string
    client_name: string
    steps: BridgeStep[]
    revenue: number
    gross_profit: number
    ebitda: number
    net_income: number
}

export function EBITDABridge({ dealId }: { dealId: string }) {
    const [data, setData] = useState<EBITDAData | null>(null)
    const [loading, setLoading] = useState(false)

    const fetchBridge = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/ebitda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deal_id: dealId })
            })
            const json = await res.json()
            if (json.error) throw new Error(json.error)
            setData(json)
        } catch (error: any) {
            toast.error(error.message || "Failed to load EBITDA Bridge")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (dealId) fetchBridge()
    }, [dealId])

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(val)

    const getBarColor = (step: BridgeStep) => {
        if (step.step_type === 'total') return 'bg-blue-500'
        if (step.step_type === 'addition') return 'bg-emerald-500'
        return 'bg-rose-500'
    }

    const getBarBg = (step: BridgeStep) => {
        if (step.step_type === 'total') return 'bg-blue-50 border-blue-200'
        if (step.step_type === 'addition') return 'bg-emerald-50 border-emerald-200'
        return 'bg-rose-50 border-rose-200'
    }

    const getIcon = (step: BridgeStep) => {
        if (step.step_type === 'total') return <Minus className="w-3 h-3" />
        if (step.step_type === 'addition') return <TrendingUp className="w-3 h-3" />
        return <TrendingDown className="w-3 h-3" />
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10 p-12">
                <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
                <p className="font-medium">No EBITDA data available</p>
                <p className="text-sm">Ensure GL transactions are uploaded and mapped for this deal.</p>
                <Button className="mt-4" onClick={fetchBridge}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Retry
                </Button>
            </div>
        )
    }

    // Find max absolute value for scaling bars
    const maxVal = Math.max(...data.steps.map(s => Math.abs(s.value)), 1)

    return (
        <div className="h-full flex flex-col space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <BarChart3 className="w-6 h-6" />
                        EBITDA Bridge
                    </h1>
                    <p className="text-muted-foreground">{data.client_name} — Revenue to EBITDA Waterfall</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchBridge}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="text-xs font-medium text-blue-600 uppercase">Revenue</div>
                    <div className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(data.revenue)}</div>
                </Card>
                <Card className="p-4 bg-indigo-50 border-indigo-200">
                    <div className="text-xs font-medium text-indigo-600 uppercase">Gross Profit</div>
                    <div className="text-2xl font-bold text-indigo-700 mt-1">{formatCurrency(data.gross_profit)}</div>
                    <div className="text-xs text-indigo-500 mt-1">
                        {data.revenue !== 0 ? ((data.gross_profit / data.revenue) * 100).toFixed(1) : 0}% margin
                    </div>
                </Card>
                <Card className="p-4 bg-emerald-50 border-emerald-200">
                    <div className="text-xs font-medium text-emerald-600 uppercase">EBITDA</div>
                    <div className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(data.ebitda)}</div>
                    <div className="text-xs text-emerald-500 mt-1">
                        {data.revenue !== 0 ? ((data.ebitda / data.revenue) * 100).toFixed(1) : 0}% margin
                    </div>
                </Card>
                <Card className="p-4 bg-slate-50 border-slate-200">
                    <div className="text-xs font-medium text-slate-600 uppercase">Net Income</div>
                    <div className="text-2xl font-bold text-slate-700 mt-1">{formatCurrency(data.net_income)}</div>
                    <div className="text-xs text-slate-500 mt-1">
                        {data.revenue !== 0 ? ((data.net_income / data.revenue) * 100).toFixed(1) : 0}% margin
                    </div>
                </Card>
            </div>

            {/* Waterfall Chart */}
            <Card className="flex-1 p-6">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-6">Waterfall</h2>
                <div className="flex items-end gap-3 h-[300px]">
                    {data.steps.map((step, idx) => {
                        const pct = Math.abs(step.value) / maxVal
                        const barHeight = Math.max(pct * 100, 8) // At least 8% height for visibility

                        return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                {/* Value label */}
                                <div className={`text-xs font-semibold ${step.value < 0 ? 'text-rose-600' : step.step_type === 'total' ? 'text-blue-600' : 'text-emerald-600'}`}>
                                    {step.value < 0 ? '-' : ''}{formatCurrency(Math.abs(step.value))}
                                </div>

                                {/* Bar */}
                                <div className="w-full flex flex-col justify-end" style={{ height: '220px' }}>
                                    <div
                                        className={`w-full rounded-t-md ${getBarColor(step)} transition-all duration-500 ease-out`}
                                        style={{ height: `${barHeight}%`, minHeight: '20px' }}
                                    />
                                </div>

                                {/* Label */}
                                <div className="text-center">
                                    <div className="text-[10px] font-medium text-foreground leading-tight">{step.label}</div>
                                    <Badge variant="outline" className={`text-[9px] mt-1 ${getBarBg(step)}`}>
                                        {getIcon(step)}
                                    </Badge>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    )
}
