"use client"

import { useState, useEffect } from "react"
import { CheckCircle, AlertTriangle, HelpCircle, Download, Check, Search, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

interface MapperScreenProps {
    dealId: string
    onNavigate: (page: string) => void
}

interface MappingRow {
    id: string
    originalAccount: string
    accountNumber: string | null
    accountName: string | null
    description: string | null
    vendorName: string | null
    transactionCount: number
    totalAmount: number
    mappingId: string | null
    mappedTo: string | null
    mappedToCode: string | null
    mappedToId: string | null
    category: string | null
    confidence: number
    approvalStatus: string
    aiReasoning: string | null
    status: 'auto-approved' | 'needs-review' | 'unmapped'
}

interface MasterAccount {
    id: string
    code: string
    name: string
    type: string
    category: string
    subcategory: string
}

export function MapperScreen({ dealId, onNavigate }: MapperScreenProps) {
    const [mappings, setMappings] = useState<MappingRow[]>([])
    const [masterAccounts, setMasterAccounts] = useState<MasterAccount[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedRow, setSelectedRow] = useState<MappingRow | null>(null)
    const [selectedRows, setSelectedRows] = useState<string[]>([])
    const [activeFilter, setActiveFilter] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [approving, setApproving] = useState(false)

    // Fetch mappings and master COA
    useEffect(() => {
        fetchData()
    }, [dealId])

    async function fetchData() {
        try {
            setLoading(true)

            // Fetch mappings and master COA in parallel
            const [mappingsRes, coaRes] = await Promise.all([
                fetch(`/api/mappings?dealId=${dealId}`),
                fetch('/api/master-coa')
            ])

            const mappingsData = await mappingsRes.json()
            const coaData = await coaRes.json()

            if (mappingsData.success) {
                setMappings(mappingsData.mappings)
            }

            if (coaData.success) {
                setMasterAccounts(coaData.accounts)
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            toast.error('Failed to load mapping data')
        } finally {
            setLoading(false)
        }
    }

    async function handleApprove(mappingId: string) {
        if (!mappingId) return

        try {
            setApproving(true)
            const res = await fetch('/api/mappings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mappingId,
                    action: 'approve'
                })
            })

            const data = await res.json()

            if (data.success) {
                toast.success('Mapping approved')
                fetchData()
                setSelectedRow(null)
            } else {
                toast.error(data.error || 'Failed to approve')
            }
        } catch (error) {
            console.error('Error approving:', error)
            toast.error('Failed to approve mapping')
        } finally {
            setApproving(false)
        }
    }

    async function handleBulkApprove() {
        const highConfidenceMappings = mappings.filter(
            m => m.confidence >= 90 && m.status !== 'auto-approved' && m.mappingId
        )

        if (highConfidenceMappings.length === 0) {
            toast.info('No high-confidence mappings to approve')
            return
        }

        try {
            setApproving(true)

            for (const mapping of highConfidenceMappings) {
                await fetch('/api/mappings', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        mappingId: mapping.mappingId,
                        action: 'approve'
                    })
                })
            }

            toast.success(`Approved ${highConfidenceMappings.length} mappings`)
            fetchData()
        } catch (error) {
            console.error('Error bulk approving:', error)
            toast.error('Failed to approve mappings')
        } finally {
            setApproving(false)
        }
    }

    async function handleMapAccount(clientAccountId: string, masterAccountId: string) {
        try {
            const res = await fetch('/api/mappings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dealId,
                    clientAccountId,
                    masterAccountId,
                    confidenceScore: 100
                })
            })

            const data = await res.json()

            if (data.success) {
                toast.success('Account mapped successfully')
                fetchData()
                setSelectedRow(null)
            } else {
                toast.error(data.error || 'Failed to map account')
            }
        } catch (error) {
            console.error('Error mapping account:', error)
            toast.error('Failed to map account')
        }
    }

    const filteredMappings = mappings.filter(mapping => {
        // Filter by Status
        if (activeFilter !== 'all') {
            if (activeFilter === 'high' && mapping.status !== 'auto-approved') return false
            if (activeFilter === 'review' && mapping.status !== 'needs-review') return false
            if (activeFilter === 'unmapped' && mapping.status !== 'unmapped') return false
        }

        // Filter by Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
                mapping.originalAccount.toLowerCase().includes(query) ||
                (mapping.description || '').toLowerCase().includes(query) ||
                (mapping.mappedTo || '').toLowerCase().includes(query) ||
                (mapping.vendorName || '').toLowerCase().includes(query)
            )
        }

        return true
    })

    const getConfidenceBadge = (confidence: number) => {
        if (confidence >= 90) {
            return <Badge className="bg-green-100 text-green-800 border-green-200">{confidence}%</Badge>
        } else if (confidence >= 70) {
            return <Badge className="bg-amber-100 text-amber-800 border-amber-200">{confidence}%</Badge>
        } else {
            return <Badge className="bg-red-100 text-red-800 border-red-200">{confidence}%</Badge>
        }
    }

    const getStatusIcon = (status: string) => {
        if (status === 'auto-approved') return <div className="w-2 h-2 bg-green-500 rounded-full" />
        if (status === 'needs-review') return <div className="w-2 h-2 bg-amber-500 rounded-full" />
        return <div className="w-2 h-2 bg-red-500 rounded-full" />
    }

    const stats = {
        autoMapped: mappings.filter(m => m.status === 'auto-approved').length,
        needsReview: mappings.filter(m => m.status === 'needs-review').length,
        unmapped: mappings.filter(m => m.status === 'unmapped').length,
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Show empty state if no client accounts exist
    if (mappings.length === 0) {
        return (
            <div className="h-[calc(100vh-14rem)] flex flex-col items-center justify-center">
                <Card className="p-12 text-center max-w-md">
                    <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Client Accounts Found</h3>
                    <p className="text-muted-foreground mb-4">
                        Upload files and process them to extract client accounts for mapping.
                    </p>
                    <Button onClick={() => onNavigate('files')}>
                        Go to File Upload
                    </Button>
                </Card>
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-14rem)] flex flex-col justify-between">
            {/* Stats Header */}
            <div className="bg-white border-b border-border p-6 pr-12">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>All changes saved</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {/* Auto-Mapped */}
                    <Card className="p-5 border-l-4 border-l-green-600 bg-green-50/30">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-2xl font-bold text-foreground">{stats.autoMapped} accounts</div>
                                <Badge className="bg-green-100 text-green-800 text-xs mt-1 border-green-200">Approved</Badge>
                                <div className="text-xs text-muted-foreground mt-1">Ready for export</div>
                            </div>
                        </div>
                    </Card>

                    {/* Needs Review */}
                    <Card className="p-5 border-l-4 border-l-amber-500 bg-amber-50/30">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-2xl font-bold text-foreground">{stats.needsReview} accounts</div>
                                <Badge className="bg-amber-100 text-amber-800 text-xs mt-1 border-amber-200">Needs Review</Badge>
                                <div className="text-xs text-muted-foreground mt-1">Manual review recommended</div>
                            </div>
                        </div>
                    </Card>

                    {/* Unmapped */}
                    <Card className="p-5 border-l-4 border-l-red-500 bg-red-50/30">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <HelpCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-2xl font-bold text-foreground">{stats.unmapped} accounts</div>
                                <Badge className="bg-red-100 text-red-800 text-xs mt-1 border-red-200">No Match Found</Badge>
                                <div className="text-xs text-muted-foreground mt-1">Requires manual mapping</div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="flex items-center justify-between bg-white border-b border-border px-4 py-4">
                {/* Left - Filters */}
                <Button
                    variant={activeFilter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveFilter('all')}
                >
                    All ({mappings.length})
                </Button>
                <Button
                    variant={activeFilter === 'high' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveFilter('high')}
                >
                    Approved ({stats.autoMapped})
                </Button>
                <Button
                    variant={activeFilter === 'review' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveFilter('review')}
                >
                    Needs Review ({stats.needsReview})
                </Button>
                <Button
                    variant={activeFilter === 'unmapped' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveFilter('unmapped')}
                >
                    Unmapped ({stats.unmapped})
                </Button>

                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search accounts..."
                        className="pl-9 w-80 bg-muted"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Right - Actions */}
                <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export to Excel
                </Button>
                <Button
                    size="sm"
                    onClick={handleBulkApprove}
                    disabled={approving || stats.needsReview === 0}
                >
                    {approving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Auto-Approve High Confidence
                </Button>
            </div>

            {/* Main Grid */}
            <div className="flex-1 overflow-auto">
                <div className="bg-white">
                    <table className="w-full">
                        <thead className="sticky top-0 bg-muted border-b border-border z-10">
                            <tr>
                                <th className="w-12 px-4 py-3">
                                    <Checkbox />
                                </th>
                                <th className="w-12 px-2 py-3"></th>
                                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">
                                    Original Account
                                </th>
                                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">
                                    Description
                                </th>
                                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">
                                    Transactions
                                </th>
                                <th className="w-8 px-2 py-3"></th>
                                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">
                                    Mapped To
                                </th>
                                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">
                                    Confidence
                                </th>
                                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredMappings.map((mapping) => (
                                <tr
                                    key={mapping.id}
                                    className={`hover:bg-muted/50 cursor-pointer transition-colors ${selectedRow?.id === mapping.id ? 'bg-blue-50' : ''
                                        } ${mapping.status === 'auto-approved' ? 'bg-green-50/20' : ''
                                        }`}
                                    onClick={() => setSelectedRow(mapping)}
                                >
                                    <td className="px-4 py-3">
                                        <Checkbox
                                            checked={selectedRows.includes(mapping.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedRows([...selectedRows, mapping.id])
                                                } else {
                                                    setSelectedRows(selectedRows.filter(id => id !== mapping.id))
                                                }
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </td>
                                    <td className="px-2 py-3">
                                        {getStatusIcon(mapping.status)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-foreground">{mapping.originalAccount}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-muted-foreground">
                                            {mapping.description || <span className="text-gray-300">—</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm text-muted-foreground">
                                            {mapping.transactionCount > 0 ? (
                                                <span>{mapping.transactionCount} txns</span>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-2 py-3">
                                        <div className="text-muted-foreground">→</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {mapping.mappedTo ? (
                                            <Badge variant="outline" className={
                                                mapping.status === 'needs-review'
                                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                            }>
                                                {mapping.mappedTo}
                                            </Badge>
                                        ) : (
                                            <span className="text-sm text-red-600 border border-dashed border-red-300 px-2 py-1 rounded">
                                                Select Category...
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {mapping.confidence > 0 ? getConfidenceBadge(mapping.confidence) : (
                                            <Badge className="bg-gray-100 text-gray-500 border-gray-200">N/A</Badge>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {mapping.status === 'auto-approved' ? (
                                            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                                <Check className="w-4 h-4" /> Approved
                                            </span>
                                        ) : mapping.status === 'needs-review' ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedRow(mapping)
                                                }}
                                            >
                                                Review
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-red-300 text-red-700 hover:bg-red-50"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedRow(mapping)
                                                }}
                                            >
                                                Map Manually
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="bg-muted border-t border-border px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {stats.needsReview + stats.unmapped > 0 ? (
                        <>
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span>{stats.needsReview + stats.unmapped} items need review before proceeding</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span>All accounts mapped and approved!</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => onNavigate('files')}>
                        Back to Upload
                    </Button>
                    <Button size="sm" onClick={() => onNavigate('open-items')}>
                        Continue to Open Items
                    </Button>
                </div>
            </div>

            {/* Mapping Detail Panel */}
            <Sheet open={!!selectedRow} onOpenChange={() => setSelectedRow(null)}>
                <SheetContent className="w-[400px] overflow-y-auto px-4">
                    {selectedRow && (
                        <>
                            <SheetHeader>
                                <SheetTitle>Mapping Detail</SheetTitle>
                            </SheetHeader>

                            <div className="mt-6 space-y-6">
                                {/* Original Account */}
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-muted-foreground uppercase">Original Account</div>
                                    <Card className="p-4 bg-muted">
                                        <div className="text-lg font-bold text-foreground">
                                            {selectedRow.accountNumber || selectedRow.originalAccount.split(' - ')[0]}
                                        </div>
                                        <div className="font-medium text-foreground mt-1">
                                            {selectedRow.accountName || selectedRow.originalAccount.split(' - ')[1] || 'No name'}
                                        </div>
                                        {selectedRow.description && (
                                            <div className="text-sm text-muted-foreground mt-2">{selectedRow.description}</div>
                                        )}
                                    </Card>
                                </div>

                                {/* Transaction Summary */}
                                {selectedRow.transactionCount > 0 && (
                                    <div className="space-y-2">
                                        <div className="text-xs font-medium text-muted-foreground uppercase">Transaction Summary</div>
                                        <Card className="p-4 bg-muted">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-2xl font-bold">{selectedRow.transactionCount}</div>
                                                    <div className="text-xs text-muted-foreground">Transactions</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold">
                                                        ${(selectedRow.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Total Amount</div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )}

                                {/* AI Recommendation or Manual Mapping */}
                                {selectedRow.mappedTo ? (
                                    <Card className="p-5 bg-blue-50 border-blue-200">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-lg">
                                                🤖
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-primary">AI Suggested Mapping</div>
                                                <div className="text-xl font-bold text-foreground mt-2">{selectedRow.mappedTo}</div>
                                            </div>
                                            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                                                <div className="text-lg font-bold text-amber-800">{selectedRow.confidence}%</div>
                                            </div>
                                        </div>

                                        {selectedRow.aiReasoning && (
                                            <div className="space-y-2">
                                                <div className="text-xs font-medium text-muted-foreground uppercase">Why This Mapping?</div>
                                                <div className="bg-white p-3 rounded-lg text-sm text-foreground leading-relaxed">
                                                    {selectedRow.aiReasoning}
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-xs font-medium text-muted-foreground uppercase">Select Mapping</div>
                                        <Select onValueChange={(value) => handleMapAccount(selectedRow.id, value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an account..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {masterAccounts.map(account => (
                                                    <SelectItem key={account.id} value={account.id}>
                                                        {account.code} - {account.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="space-y-3">
                                    {selectedRow.mappingId && selectedRow.status !== 'auto-approved' && (
                                        <Button
                                            className="w-full"
                                            size="lg"
                                            onClick={() => handleApprove(selectedRow.mappingId!)}
                                            disabled={approving}
                                        >
                                            {approving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                            Approve Mapping
                                        </Button>
                                    )}

                                    {selectedRow.status === 'auto-approved' && (
                                        <div className="text-center text-green-600 font-medium py-4">
                                            <Check className="w-6 h-6 mx-auto mb-2" />
                                            This mapping has been approved
                                        </div>
                                    )}

                                    <Button variant="ghost" size="sm" className="w-full" onClick={() => setSelectedRow(null)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
