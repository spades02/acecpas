"use client"

import { useState, useEffect, useMemo } from "react"
import { X, Search, Loader2, ArrowUpDown, AlertTriangle, Plus, ExternalLink, Flame, TrendingDown, CircleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

interface Anomaly {
    category: string
    period: string
    type: 'spike' | 'drop' | 'new_category' | 'missing' | 'threshold'
    severity: 'low' | 'medium' | 'high'
    message: string
    value: number
    percentChange?: number
}

interface DrillDownPanelProps {
    dealId: string
    category: string
    period: string | null // null = "Total" column clicked
    onClose: () => void
    anomalies?: Anomaly[]
}

interface GLTransaction {
    id: string
    transaction_date: string | null
    account_number: string | null
    account_name: string | null
    description: string | null
    vendor_name: string | null
    amount: number
    debit_credit: string | null
}

type SortField = 'transaction_date' | 'amount' | 'account_name' | 'vendor_name'
type SortDirection = 'asc' | 'desc'

export function DrillDownPanel({ dealId, category, period, onClose, anomalies = [] }: DrillDownPanelProps) {
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState<GLTransaction[]>([])
    const [summary, setSummary] = useState<{ count: number; totalAmount: number }>({ count: 0, totalAmount: 0 })
    const [searchQuery, setSearchQuery] = useState("")
    const [sortField, setSortField] = useState<SortField>('amount')
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

    useEffect(() => {
        fetchTransactions()
    }, [dealId, category, period])

    async function fetchTransactions() {
        try {
            setLoading(true)
            const params = new URLSearchParams({ dealId, category })
            if (period) params.set('period', period)

            const res = await fetch(`/api/drill-down?${params.toString()}`)
            const json = await res.json()

            if (json.error) {
                toast.error(json.error)
                return
            }

            setTransactions(json.transactions || [])
            setSummary(json.summary || { count: 0, totalAmount: 0 })
        } catch (error) {
            console.error("Failed to fetch drill-down data:", error)
            toast.error("Failed to load transactions")
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)
    }

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('desc')
        }
    }

    const filteredAndSorted = useMemo(() => {
        let result = [...transactions]

        // Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            result = result.filter(tx =>
                (tx.description || '').toLowerCase().includes(q) ||
                (tx.vendor_name || '').toLowerCase().includes(q) ||
                (tx.account_name || '').toLowerCase().includes(q) ||
                (tx.account_number || '').toLowerCase().includes(q)
            )
        }

        // Sort
        result.sort((a, b) => {
            let valA: any, valB: any

            switch (sortField) {
                case 'amount':
                    valA = Math.abs(a.amount)
                    valB = Math.abs(b.amount)
                    break
                case 'transaction_date':
                    valA = a.transaction_date || ''
                    valB = b.transaction_date || ''
                    break
                case 'account_name':
                    valA = (a.account_name || '').toLowerCase()
                    valB = (b.account_name || '').toLowerCase()
                    break
                case 'vendor_name':
                    valA = (a.vendor_name || '').toLowerCase()
                    valB = (b.vendor_name || '').toLowerCase()
                    break
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1
            return 0
        })

        return result
    }, [transactions, searchQuery, sortField, sortDirection])

    // Identify "driver" transactions (>50% of total variance)
    const driverThreshold = Math.abs(summary.totalAmount) * 0.5
    const driverIds = useMemo(() => {
        const sorted = [...transactions].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
        const ids = new Set<string>()
        let cumulative = 0
        for (const tx of sorted) {
            if (cumulative >= driverThreshold) break
            ids.add(tx.id)
            cumulative += Math.abs(tx.amount)
        }
        return ids
    }, [transactions, driverThreshold])

    return (
        <div className="fixed inset-y-0 right-0 w-[600px] bg-white border-l shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="border-b p-5 bg-linear-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-lg font-bold text-foreground">{category}</h3>
                        <p className="text-sm text-muted-foreground">
                            {period || 'All Periods'} · {summary.count} transactions
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3 bg-slate-50 border-slate-200">
                        <div className="text-xs text-muted-foreground font-medium uppercase">Total Amount</div>
                        <div className="text-xl font-bold mt-1">{formatCurrency(summary.totalAmount)}</div>
                    </Card>
                    <Card className="p-3 bg-slate-50 border-slate-200">
                        <div className="text-xs text-muted-foreground font-medium uppercase">Transaction Count</div>
                        <div className="text-xl font-bold mt-1">{summary.count}</div>
                    </Card>
                </div>
                {/* Anomaly Alerts */}
                {anomalies.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {anomalies.map((a, i) => {
                            const severityStyles = {
                                high: 'bg-red-50 border-red-200 text-red-900',
                                medium: 'bg-amber-50 border-amber-200 text-amber-900',
                                low: 'bg-yellow-50 border-yellow-200 text-yellow-900'
                            }
                            const severityIcons = {
                                spike: <Flame className="w-3.5 h-3.5" />,
                                drop: <TrendingDown className="w-3.5 h-3.5" />,
                                missing: <CircleAlert className="w-3.5 h-3.5" />,
                                new_category: <CircleAlert className="w-3.5 h-3.5" />,
                                threshold: <AlertTriangle className="w-3.5 h-3.5" />
                            }
                            return (
                                <div key={i} className={`flex items-start gap-2 p-2.5 rounded-md border text-xs ${severityStyles[a.severity]}`}>
                                    {severityIcons[a.type] || severityIcons.threshold}
                                    <div>
                                        <span className="font-semibold uppercase text-[10px]">{a.severity} · {a.type.replace('_', ' ')}</span>
                                        <p className="mt-0.5">{a.message}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b bg-white">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search transactions..."
                        className="pl-9 bg-muted/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Transaction List */}
            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredAndSorted.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                        <p className="text-sm">No transactions found.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 sticky top-0 z-10">
                                <TableHead
                                    className="text-xs cursor-pointer hover:text-foreground transition-colors w-[90px]"
                                    onClick={() => toggleSort('transaction_date')}
                                >
                                    <span className="flex items-center gap-1">
                                        Date
                                        {sortField === 'transaction_date' && <ArrowUpDown className="w-3 h-3" />}
                                    </span>
                                </TableHead>
                                <TableHead className="text-xs">Description</TableHead>
                                <TableHead
                                    className="text-xs cursor-pointer hover:text-foreground transition-colors"
                                    onClick={() => toggleSort('vendor_name')}
                                >
                                    <span className="flex items-center gap-1">
                                        Vendor
                                        {sortField === 'vendor_name' && <ArrowUpDown className="w-3 h-3" />}
                                    </span>
                                </TableHead>
                                <TableHead
                                    className="text-xs text-right cursor-pointer hover:text-foreground transition-colors"
                                    onClick={() => toggleSort('amount')}
                                >
                                    <span className="flex items-center justify-end gap-1">
                                        Amount
                                        {sortField === 'amount' && <ArrowUpDown className="w-3 h-3" />}
                                    </span>
                                </TableHead>
                                <TableHead className="text-xs w-[70px]">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSorted.map((tx) => {
                                const isDriver = driverIds.has(tx.id)

                                return (
                                    <TableRow
                                        key={tx.id}
                                        className={`text-sm ${isDriver ? 'bg-amber-50/60 border-l-2 border-l-amber-400' : ''}`}
                                    >
                                        <TableCell className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDate(tx.transaction_date)}
                                        </TableCell>
                                        <TableCell className="py-2.5 max-w-[180px]">
                                            <div className="truncate text-foreground" title={tx.description || ''}>
                                                {tx.description || tx.account_name || '-'}
                                            </div>
                                            {isDriver && (
                                                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] mt-0.5">
                                                    Driver
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-2.5 text-xs text-muted-foreground max-w-[100px] truncate">
                                            {tx.vendor_name || '-'}
                                        </TableCell>
                                        <TableCell className={`py-2.5 text-right font-mono text-xs font-medium ${tx.amount < 0 ? 'text-red-600' : 'text-green-700'}`}>
                                            {formatCurrency(tx.amount)}
                                        </TableCell>
                                        <TableCell className="py-2.5">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                                                onClick={async (e) => {
                                                    e.stopPropagation()
                                                    try {
                                                        const res = await fetch('/api/adjustments', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                dealId,
                                                                category: category,
                                                                description: tx.description || tx.account_name || 'Addback',
                                                                amount: Math.abs(tx.amount),
                                                                period: period || null,
                                                                sourceType: 'one_click_addback',
                                                                sourceTransactionId: tx.id,
                                                                sourceTransactionDescription: `${tx.account_name || ''} - ${tx.description || ''} (${formatDate(tx.transaction_date)})`
                                                            })
                                                        })
                                                        const json = await res.json()
                                                        if (json.error) throw new Error(json.error)
                                                        toast.success("Addback created!", {
                                                            description: `${formatCurrency(Math.abs(tx.amount))} added as a "${category}" adjustment.`
                                                        })
                                                    } catch (err: any) {
                                                        toast.error(err.message || "Failed to create addback")
                                                    }
                                                }}
                                                title="Create one-click addback"
                                            >
                                                <Plus className="w-3.5 h-3.5 mr-1" />
                                                Add
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-muted/30 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                    Showing {filteredAndSorted.length} of {transactions.length} transactions
                </div>
                <Button variant="outline" size="sm" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    )
}
