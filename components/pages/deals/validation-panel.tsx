"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, AlertTriangle, XCircle, SkipForward, RefreshCw, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

interface ValidationPanelProps {
    dealId: string
}

interface ValidationCheck {
    id: string
    name: string
    description: string
    status: 'pass' | 'warning' | 'fail' | 'skipped'
    details: string
    variance?: number
    variancePct?: number
}

interface ValidationSummary {
    total: number
    passed: number
    warnings: number
    failures: number
    skipped: number
    overallStatus: 'pass' | 'warning' | 'fail'
}

export function ValidationPanel({ dealId }: ValidationPanelProps) {
    const [loading, setLoading] = useState(true)
    const [checks, setChecks] = useState<ValidationCheck[]>([])
    const [summary, setSummary] = useState<ValidationSummary>({
        total: 0, passed: 0, warnings: 0, failures: 0, skipped: 0, overallStatus: 'pass'
    })

    useEffect(() => {
        runValidation()
    }, [dealId])

    async function runValidation() {
        try {
            setLoading(true)
            const res = await fetch(`/api/validation?dealId=${dealId}`)
            const json = await res.json()
            if (json.error) { toast.error(json.error); return }
            setChecks(json.checks || [])
            setSummary(json.summary || summary)
        } catch {
            toast.error("Validation failed")
        } finally {
            setLoading(false)
        }
    }

    const statusIcon = (status: string) => {
        switch (status) {
            case 'pass': return <CheckCircle className="w-5 h-5 text-green-500" />
            case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />
            case 'fail': return <XCircle className="w-5 h-5 text-red-500" />
            case 'skipped': return <SkipForward className="w-5 h-5 text-gray-400" />
            default: return null
        }
    }

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pass: 'bg-green-100 text-green-800 border-green-200',
            warning: 'bg-amber-100 text-amber-800 border-amber-200',
            fail: 'bg-red-100 text-red-800 border-red-200',
            skipped: 'bg-gray-100 text-gray-600 border-gray-200'
        }
        return (
            <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${styles[status] || ''}`}>
                {status}
            </Badge>
        )
    }

    const overallColor: Record<string, string> = {
        pass: 'from-green-50 to-green-100/50 border-green-200',
        warning: 'from-amber-50 to-amber-100/50 border-amber-200',
        fail: 'from-red-50 to-red-100/50 border-red-200'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Running validation checks...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Data Validation</h2>
                        <p className="text-sm text-muted-foreground">Cross-source integrity checks</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={runValidation}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Re-run Checks
                </Button>
            </div>

            {/* Overall Status */}
            <Card className={`p-5 border shadow-sm bg-linear-to-r ${overallColor[summary.overallStatus]}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {statusIcon(summary.overallStatus)}
                        <div>
                            <p className="font-bold text-lg capitalize">
                                {summary.overallStatus === 'pass' ? 'All Checks Passed' :
                                    summary.overallStatus === 'warning' ? 'Some Warnings Found' :
                                        'Issues Detected'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {summary.passed} passed, {summary.warnings} warnings, {summary.failures} failures, {summary.skipped} skipped
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <div className="text-3xl font-bold">
                                {summary.total > 0 ? Math.round(((summary.passed) / (summary.total - summary.skipped)) * 100) : 0}%
                            </div>
                            <div className="text-xs text-muted-foreground">Pass Rate</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Check List */}
            <div className="flex-1 space-y-3 overflow-auto">
                {checks.map(check => (
                    <Card key={check.id} className="p-4 border shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                {statusIcon(check.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-sm">{check.name}</span>
                                    {statusBadge(check.status)}
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{check.description}</p>
                                <div className="bg-muted/50 rounded-md p-2.5">
                                    <p className="text-xs font-medium">{check.details}</p>
                                    {check.variance !== undefined && check.variance > 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Variance: ${check.variance.toLocaleString()}
                                        </p>
                                    )}
                                    {check.variancePct !== undefined && check.variancePct > 0 && (
                                        <div className="mt-2">
                                            <div className="w-full bg-gray-200 h-1.5 rounded-full">
                                                <div
                                                    className={`h-1.5 rounded-full transition-all ${check.status === 'pass' ? 'bg-green-500' : check.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}
                                                    style={{ width: `${100 - check.variancePct}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
