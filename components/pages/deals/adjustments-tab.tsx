"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus, Trash2, CheckCircle2, XCircle, Edit2, TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface AdjustmentsTabProps {
    dealId: string
}

interface Adjustment {
    id: string
    category: string
    subcategory: string | null
    description: string
    amount: number
    period: string | null
    source_type: string
    source_transaction_description: string | null
    status: 'draft' | 'pending_review' | 'approved' | 'rejected'
    created_by: string | null
    reviewed_by: string | null
    reviewed_at: string | null
    review_notes: string | null
    created_at: string
}

interface AdjustmentSummary {
    total: number
    totalAddbacks: number
    totalDeductions: number
    netAdjustment: number
    pendingCount: number
}

const ADJUSTMENT_CATEGORIES = [
    'Owner Compensation',
    'One-Time Expenses',
    'Related Party Transactions',
    'Non-Recurring Revenue',
    'Non-Cash Expenses',
    'Discretionary Expenses',
    'Rent Adjustment',
    'Pro Forma Adjustment',
    'Management Fees',
    'Other'
]

export function AdjustmentsTab({ dealId }: AdjustmentsTabProps) {
    const [loading, setLoading] = useState(true)
    const [adjustments, setAdjustments] = useState<Adjustment[]>([])
    const [summary, setSummary] = useState<AdjustmentSummary>({ total: 0, totalAddbacks: 0, totalDeductions: 0, netAdjustment: 0, pendingCount: 0 })
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    // Form state
    const [formCategory, setFormCategory] = useState('')
    const [formDescription, setFormDescription] = useState('')
    const [formAmount, setFormAmount] = useState('')
    const [formPeriod, setFormPeriod] = useState('')

    useEffect(() => {
        fetchAdjustments()
    }, [dealId])

    async function fetchAdjustments() {
        try {
            setLoading(true)
            const res = await fetch(`/api/adjustments?dealId=${dealId}`)
            const json = await res.json()
            if (json.error) { toast.error(json.error); return }
            setAdjustments(json.adjustments || [])
            setSummary(json.summary || { total: 0, totalAddbacks: 0, totalDeductions: 0, netAdjustment: 0, pendingCount: 0 })
        } catch (err) {
            toast.error("Failed to load adjustments")
        } finally {
            setLoading(false)
        }
    }

    function resetForm() {
        setFormCategory('')
        setFormDescription('')
        setFormAmount('')
        setFormPeriod('')
        setEditingId(null)
    }

    function openEditDialog(adj: Adjustment) {
        setFormCategory(adj.category)
        setFormDescription(adj.description)
        setFormAmount(String(adj.amount))
        setFormPeriod(adj.period || '')
        setEditingId(adj.id)
        setShowAddDialog(true)
    }

    async function handleSave() {
        if (!formCategory || !formDescription || !formAmount) {
            toast.error("Please fill in all required fields")
            return
        }

        setSaving(true)
        try {
            if (editingId) {
                // Update
                const res = await fetch('/api/adjustments', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: editingId,
                        category: formCategory,
                        description: formDescription,
                        amount: parseFloat(formAmount),
                        period: formPeriod || null
                    })
                })
                const json = await res.json()
                if (json.error) throw new Error(json.error)
                toast.success("Adjustment updated")
            } else {
                // Create
                const res = await fetch('/api/adjustments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        dealId,
                        category: formCategory,
                        description: formDescription,
                        amount: parseFloat(formAmount),
                        period: formPeriod || null,
                        sourceType: 'manual'
                    })
                })
                const json = await res.json()
                if (json.error) throw new Error(json.error)
                toast.success("Adjustment created")
            }
            setShowAddDialog(false)
            resetForm()
            fetchAdjustments()
        } catch (err: any) {
            toast.error(err.message || "Failed to save")
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id: string) {
        try {
            const res = await fetch(`/api/adjustments?id=${id}`, { method: 'DELETE' })
            const json = await res.json()
            if (json.error) throw new Error(json.error)
            toast.success("Adjustment deleted")
            fetchAdjustments()
        } catch (err: any) {
            toast.error(err.message || "Failed to delete")
        }
    }

    async function handleStatusChange(id: string, status: string) {
        try {
            const res = await fetch('/api/adjustments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            })
            const json = await res.json()
            if (json.error) throw new Error(json.error)
            toast.success(`Adjustment ${status === 'approved' ? 'approved' : 'rejected'}`)
            fetchAdjustments()
        } catch (err: any) {
            toast.error(err.message)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { label: string; className: string }> = {
            'draft': { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-200' },
            'pending_review': { label: 'Pending', className: 'bg-amber-100 text-amber-800 border-amber-200' },
            'approved': { label: 'Approved', className: 'bg-green-100 text-green-800 border-green-200' },
            'rejected': { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200' },
        }
        const v = variants[status] || variants['draft']
        return <Badge variant="outline" className={v.className}>{v.label}</Badge>
    }

    const getSourceBadge = (sourceType: string) => {
        if (sourceType === 'one_click_addback') return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">Addback</Badge>
        if (sourceType === 'ai_suggested') return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">AI</Badge>
        return null
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Header with Summary Cards */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Adjustments</h2>
                    <p className="text-sm text-muted-foreground">Manage QoE addbacks and adjustments</p>
                </div>
                <Button size="sm" onClick={() => { resetForm(); setShowAddDialog(true) }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Adjustment
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="p-4 bg-white border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground font-medium uppercase">Addbacks</div>
                            <div className="text-lg font-bold text-green-700">{formatCurrency(summary.totalAddbacks)}</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground font-medium uppercase">Deductions</div>
                            <div className="text-lg font-bold text-red-700">{formatCurrency(summary.totalDeductions)}</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground font-medium uppercase">Net Adjustment</div>
                            <div className="text-lg font-bold">{formatCurrency(summary.netAdjustment)}</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 bg-white border shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground font-medium uppercase">Pending Review</div>
                            <div className="text-lg font-bold">{summary.pendingCount}</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Adjustments Table */}
            <Card className="flex-1 overflow-auto shadow-sm border-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="font-bold text-gray-900">Category</TableHead>
                            <TableHead className="font-bold text-gray-900">Description</TableHead>
                            <TableHead className="font-bold text-gray-900">Period</TableHead>
                            <TableHead className="text-right font-bold text-gray-900">Amount</TableHead>
                            <TableHead className="font-bold text-gray-900">Source</TableHead>
                            <TableHead className="font-bold text-gray-900">Status</TableHead>
                            <TableHead className="font-bold text-gray-900 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {adjustments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    No adjustments yet. Click "Add Adjustment" to create one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            adjustments.map(adj => (
                                <TableRow key={adj.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-medium">{adj.category}</TableCell>
                                    <TableCell className="max-w-[250px]">
                                        <div className="truncate" title={adj.description}>{adj.description}</div>
                                        {adj.source_transaction_description && (
                                            <div className="text-xs text-muted-foreground truncate mt-0.5" title={adj.source_transaction_description}>
                                                From: {adj.source_transaction_description}
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">{adj.period || 'All'}</TableCell>
                                    <TableCell className={`text-right font-mono font-semibold ${adj.amount >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        {adj.amount >= 0 ? '+' : ''}{formatCurrency(adj.amount)}
                                    </TableCell>
                                    <TableCell>{getSourceBadge(adj.source_type)}</TableCell>
                                    <TableCell>{getStatusBadge(adj.status)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            {adj.status === 'draft' && (
                                                <>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(adj)}>
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatusChange(adj.id, 'approved')}>
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </>
                                            )}
                                            {adj.status === 'pending_review' && (
                                                <>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStatusChange(adj.id, 'approved')}>
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleStatusChange(adj.id, 'rejected')}>
                                                        <XCircle className="w-3.5 h-3.5" />
                                                    </Button>
                                                </>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(adj.id)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* EBITDA Bridge Preview */}
            {adjustments.length > 0 && (
                <EbitdaBridge adjustments={adjustments.filter(a => a.status === 'approved' || a.status === 'draft')} />
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={showAddDialog} onOpenChange={(open) => { if (!open) { setShowAddDialog(false); resetForm() } }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Adjustment' : 'Add Adjustment'}</DialogTitle>
                        <DialogDescription>
                            {editingId ? 'Update the adjustment details.' : 'Create a new QoE adjustment or addback.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category *</label>
                            <Select value={formCategory} onValueChange={setFormCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ADJUSTMENT_CATEGORIES.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description *</label>
                            <Input
                                placeholder="e.g., Owner salary above market rate"
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount * <span className="text-muted-foreground text-xs">(+ for addback)</span></label>
                                <Input
                                    type="number"
                                    placeholder="50000"
                                    value={formAmount}
                                    onChange={(e) => setFormAmount(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Period <span className="text-muted-foreground text-xs">(optional)</span></label>
                                <Input
                                    placeholder="2024-01"
                                    value={formPeriod}
                                    onChange={(e) => setFormPeriod(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setShowAddDialog(false); resetForm() }}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {editingId ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

/* ──────────── EMBEDDED: EBITDA Bridge Waterfall ──────────── */

function EbitdaBridge({ adjustments }: { adjustments: Adjustment[] }) {
    // Group adjustments by category for the waterfall
    const grouped = adjustments.reduce((acc, adj) => {
        if (!acc[adj.category]) acc[adj.category] = 0
        acc[adj.category] += Number(adj.amount)
        return acc
    }, {} as Record<string, number>)

    const entries = Object.entries(grouped).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))

    const netTotal = entries.reduce((sum, [, val]) => sum + val, 0)

    // For the visual waterfall, compute running totals
    let running = 0

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    // Find max absolute value for bar scaling
    const maxVal = Math.max(
        Math.abs(netTotal),
        ...entries.map(([, v]) => Math.abs(v))
    ) || 1

    return (
        <Card className="p-5 bg-white border shadow-sm">
            <h3 className="text-base font-bold mb-1">EBITDA Bridge</h3>
            <p className="text-sm text-muted-foreground mb-4">Waterfall of approved/draft adjustments</p>

            <div className="space-y-2">
                {/* Reported EBITDA placeholder */}
                <div className="flex items-center gap-3">
                    <span className="w-[180px] text-sm font-medium text-right truncate">Reported EBITDA</span>
                    <div className="flex-1 h-8 bg-slate-100 rounded relative overflow-hidden">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                            (From Income Statement)
                        </div>
                    </div>
                    <span className="w-[100px] text-right text-sm font-mono text-muted-foreground">—</span>
                </div>

                {/* Adjustment Bars */}
                {entries.map(([category, amount]) => {
                    running += amount
                    const widthPct = Math.min((Math.abs(amount) / maxVal) * 80, 80) // Max 80%
                    const isPositive = amount >= 0

                    return (
                        <div key={category} className="flex items-center gap-3">
                            <span className="w-[180px] text-sm text-right truncate" title={category}>
                                {category}
                            </span>
                            <div className="flex-1 h-8 bg-slate-50 rounded relative overflow-hidden">
                                <div
                                    className={`absolute top-0 h-full rounded transition-all duration-500 ${isPositive ? 'bg-green-400/70 left-0' : 'bg-red-400/70 right-0'
                                        }`}
                                    style={{ width: `${widthPct}%` }}
                                />
                                <div className="absolute inset-0 flex items-center px-3">
                                    <span className={`text-xs font-semibold ${isPositive ? 'text-green-900' : 'text-red-900'}`}>
                                        {isPositive ? '+' : ''}{formatCurrency(amount)}
                                    </span>
                                </div>
                            </div>
                            <span className="w-[100px] text-right text-sm font-mono text-muted-foreground">{formatCurrency(running)}</span>
                        </div>
                    )
                })}

                {/* Net Total */}
                <div className="flex items-center gap-3 border-t-2 border-slate-300 pt-2 mt-2">
                    <span className="w-[180px] text-sm font-bold text-right">Adjusted EBITDA</span>
                    <div className="flex-1 h-9 bg-primary/10 rounded relative overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-primary/30 rounded"
                            style={{ width: `${Math.min((Math.abs(netTotal) / maxVal) * 80, 80)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-3">
                            <span className="text-sm font-bold text-primary">
                                Net: {formatCurrency(netTotal)}
                            </span>
                        </div>
                    </div>
                    <span className="w-[100px] text-right text-sm font-mono font-bold">{formatCurrency(netTotal)}</span>
                </div>
            </div>
        </Card>
    )
}
