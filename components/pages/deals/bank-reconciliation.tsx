"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, ArrowLeftRight, Upload, RefreshCw, Download } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

interface BankReconciliationProps {
    dealId: string
}

interface BankTransaction {
    id: string
    transaction_date: string | null
    description: string
    amount: number
    bank_account: string | null
    reference: string | null
    matched_gl_id: string | null
    match_confidence: number | null
    match_method: string | null
    is_reconciled: boolean
}

interface ReconciliationSummary {
    total: number
    matched: number
    unmatched: number
    matchRate: number
    totalAmount: number
    matchedAmount: number
    unmatchedAmount: number
}


// Simple CSV parser helper
function parseCSV(text: string) {
    const lines = text.split(/\r?\n/).filter(l => l.trim())
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

    return lines.slice(1).map(line => {
        // Handle quoted fields
        const values: string[] = []
        let current = ''
        let inQuotes = false

        for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') {
                inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }
        values.push(current.trim())

        const row: any = {}
        headers.forEach((h, i) => {
            let val = values[i]
            if (val && val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
            row[h] = val
        })
        return row
    })
}

type FilterMode = 'all' | 'matched' | 'unmatched'

export function BankReconciliation({ dealId }: BankReconciliationProps) {
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState<BankTransaction[]>([])
    const [summary, setSummary] = useState<ReconciliationSummary>({
        total: 0, matched: 0, unmatched: 0, matchRate: 0,
        totalAmount: 0, matchedAmount: 0, unmatchedAmount: 0
    })
    const [filter, setFilter] = useState<FilterMode>('all')

    useEffect(() => {
        fetchData()
    }, [dealId])

    async function fetchData() {
        try {
            setLoading(true)
            const res = await fetch(`/api/bank-statements?dealId=${dealId}`)
            const json = await res.json()
            if (json.error) { toast.error(json.error); return }
            setTransactions(json.transactions || [])
            setSummary(json.summary || summary)
        } catch {
            toast.error("Failed to load bank reconciliation data")
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                const text = event.target?.result as string
                const data = parseCSV(text)

                // Map CSV fields to API expected format
                const transactions = data.map((row: any) => ({
                    date: row.date || row.transaction_date || row['transaction date'],
                    description: row.description || row.desc || row.memo,
                    amount: parseFloat((row.amount || row.amt || '0').replace(/[$,]/g, '')),
                    bankAccount: row['bank account'] || row.account,
                    reference: row.reference || row.ref || row['check number']
                })).filter((t: any) => t.date && !isNaN(t.amount))

                if (transactions.length === 0) {
                    toast.error("No valid transactions found in CSV. Check headers: Date, Description, Amount")
                    return
                }

                toast.info(`Uploading ${transactions.length} transactions...`)
                setLoading(true)

                const res = await fetch('/api/bank-statements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dealId, transactions })
                })

                const json = await res.json()
                if (json.error) throw new Error(json.error)

                toast.success(`Processed ${json.inserted} transactions. Matched: ${json.matched}`)
                fetchData() // Reload
            } catch (error: any) {
                toast.error(error.message || "Failed to process bank statement")
                setLoading(false)
            }
        }
        reader.readAsText(file)
    }

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', {
        style: 'currency', currency: 'USD',
        minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount)

    const formatDate = (date: string | null) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const filtered = transactions.filter(t => {
        if (filter === 'matched') return !!t.matched_gl_id
        if (filter === 'unmatched') return !t.matched_gl_id
        return true
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Bank Reconciliation</h2>
                    <p className="text-sm text-muted-foreground">Match bank transactions to GL entries</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchData}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('bank-upload')?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Statement
                    </Button>
                    <input
                        id="bank-upload"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileUpload}
                    />
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="p-4 border-0 shadow-sm bg-linear-to-br from-slate-50 to-white">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Transactions</div>
                    <div className="text-2xl font-bold mt-1">{summary.total}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{formatCurrency(summary.totalAmount)}</div>
                </Card>
                <Card className="p-4 border-0 shadow-sm bg-linear-to-br from-green-50 to-white">
                    <div className="text-xs font-medium text-green-700 uppercase tracking-wider">Matched</div>
                    <div className="text-2xl font-bold text-green-700 mt-1">{summary.matched}</div>
                    <div className="text-sm text-green-600 mt-0.5">{formatCurrency(summary.matchedAmount)}</div>
                </Card>
                <Card className="p-4 border-0 shadow-sm bg-linear-to-br from-red-50 to-white">
                    <div className="text-xs font-medium text-red-700 uppercase tracking-wider">Unmatched</div>
                    <div className="text-2xl font-bold text-red-700 mt-1">{summary.unmatched}</div>
                    <div className="text-sm text-red-600 mt-0.5">{formatCurrency(summary.unmatchedAmount)}</div>
                </Card>
                <Card className="p-4 border-0 shadow-sm bg-linear-to-br from-blue-50 to-white">
                    <div className="text-xs font-medium text-blue-700 uppercase tracking-wider">Match Rate</div>
                    <div className="text-2xl font-bold text-blue-700 mt-1">{summary.matchRate}%</div>
                    <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${summary.matchRate}%` }} />
                    </div>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg w-fit">
                {(['all', 'matched', 'unmatched'] as FilterMode[]).map(mode => (
                    <Button
                        key={mode}
                        variant={filter === mode ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter(mode)}
                        className="text-xs capitalize px-4"
                    >
                        {mode === 'all' ? `All (${summary.total})` :
                            mode === 'matched' ? `Matched (${summary.matched})` :
                                `Unmatched (${summary.unmatched})`}
                    </Button>
                ))}
            </div>

            {/* Transactions Table */}
            <Card className="flex-1 overflow-auto shadow-sm border-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50 sticky top-0 z-10">
                            <TableHead className="font-bold text-gray-900 w-8">Status</TableHead>
                            <TableHead className="font-bold text-gray-900">Date</TableHead>
                            <TableHead className="font-bold text-gray-900">Description</TableHead>
                            <TableHead className="font-bold text-gray-900 text-right">Amount</TableHead>
                            <TableHead className="font-bold text-gray-900">Account</TableHead>
                            <TableHead className="font-bold text-gray-900">Match</TableHead>
                            <TableHead className="font-bold text-gray-900 text-center">Confidence</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    {summary.total === 0 ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <ArrowLeftRight className="w-8 h-8 text-muted-foreground/50" />
                                            <p>No bank statements uploaded yet.</p>
                                            <p className="text-xs">Upload a bank statement CSV to start reconciliation.</p>
                                        </div>
                                    ) : `No ${filter} transactions found.`}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map(tx => (
                                <TableRow key={tx.id} className={`transition-colors ${tx.matched_gl_id ? 'hover:bg-green-50/50' : 'hover:bg-red-50/50'}`}>
                                    <TableCell>
                                        {tx.matched_gl_id ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-red-400" />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium text-sm">{formatDate(tx.transaction_date)}</TableCell>
                                    <TableCell className="text-sm max-w-[300px] truncate">{tx.description}</TableCell>
                                    <TableCell className={`text-right font-mono text-sm ${tx.amount >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        {formatCurrency(tx.amount)}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{tx.bank_account || '-'}</TableCell>
                                    <TableCell>
                                        {tx.match_method ? (
                                            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
                                                {tx.match_method.replace(/_/g, ' ')}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-[10px] bg-red-50 text-red-600 border-red-200">
                                                No match
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {tx.match_confidence !== null ? (
                                            <span className={`text-xs font-semibold ${tx.match_confidence >= 90 ? 'text-green-700' : 'text-amber-600'}`}>
                                                {tx.match_confidence}%
                                            </span>
                                        ) : '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    )
}
