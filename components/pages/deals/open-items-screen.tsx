"use client"

import { useEffect, useState } from "react"
import { AlertCircle, AlertTriangle, Info, Flag, Loader2, Plus, Send, Link, CheckCircle, MoreVertical, Trash2, Mail, Copy } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface OpenItem {
    id: string
    question: string
    context: string | null
    priority: number
    status: string
    clientResponse: string | null
    respondedAt: string | null
    isResolved: boolean
    resolvedBy: string | null
    resolvedAt: string | null
    createdAt: string
    anomaly: {
        id: string
        title: string
        description: string
        anomaly_type: string
        severity: number
    } | null
}

interface OpenItemsScreenProps {
    dealId: string
    onNavigate: (page: string) => void
}

export function OpenItemsScreen({ dealId, onNavigate }: OpenItemsScreenProps) {
    const [items, setItems] = useState<OpenItem[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'pending' | 'responded' | 'resolved'>('all')

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showLinkDialog, setShowLinkDialog] = useState(false)
    const [selectedItems, setSelectedItems] = useState<string[]>([])
    const [generatedLink, setGeneratedLink] = useState<string | null>(null)

    // Form state
    const [newQuestion, setNewQuestion] = useState('')
    const [newContext, setNewContext] = useState('')
    const [newPriority, setNewPriority] = useState(5)
    const [clientEmail, setClientEmail] = useState('')
    const [clientName, setClientName] = useState('')
    const [creating, setCreating] = useState(false)
    const [generatingLink, setGeneratingLink] = useState(false)
    const [sendingEmail, setSendingEmail] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    // Fetch open items from database
    useEffect(() => {
        fetchItems()
    }, [dealId])

    async function fetchItems() {
        try {
            setLoading(true)
            const res = await fetch(`/api/open-items?dealId=${dealId}`)
            const data = await res.json()

            if (data.success) {
                setItems(data.items)
            } else {
                toast.error('Failed to load open items')
            }
        } catch (error) {
            console.error('Error fetching items:', error)
            toast.error('Failed to load open items')
        } finally {
            setLoading(false)
        }
    }

    async function handleCreate() {
        if (!newQuestion.trim()) return

        try {
            setCreating(true)
            const res = await fetch('/api/open-items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dealId,
                    question: newQuestion,
                    context: newContext || null,
                    priority: newPriority
                })
            })

            const data = await res.json()

            if (data.success) {
                toast.success('Open item created')
                setShowCreateDialog(false)
                setNewQuestion('')
                setNewContext('')
                setNewPriority(5)
                fetchItems()
            } else {
                toast.error(data.error || 'Failed to create item')
            }
        } catch (error) {
            console.error('Error creating item:', error)
            toast.error('Failed to create item')
        } finally {
            setCreating(false)
        }
    }

    async function handleToggleResolve(itemId: string, isResolved: boolean) {
        try {
            const res = await fetch('/api/open-items', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: itemId,
                    action: isResolved ? 'unresolve' : 'resolve'
                })
            })

            const data = await res.json()

            if (data.success) {
                toast.success(isResolved ? 'Item reopened' : 'Item resolved')
                fetchItems()
            } else {
                toast.error('Failed to update item')
            }
        } catch (error) {
            console.error('Error updating item:', error)
            toast.error('Failed to update item')
        }
    }

    async function handleDelete(itemId: string) {
        if (!confirm('Are you sure you want to delete this item?')) return

        try {
            const res = await fetch(`/api/open-items?id=${itemId}`, {
                method: 'DELETE'
            })

            const data = await res.json()

            if (data.success) {
                toast.success('Item deleted')
                fetchItems()
            } else {
                toast.error('Failed to delete item')
            }
        } catch (error) {
            console.error('Error deleting item:', error)
            toast.error('Failed to delete item')
        }
    }

    async function handleGenerateLink() {
        if (selectedItems.length === 0) {
            toast.error('Select at least one item')
            return
        }

        try {
            setGeneratingLink(true)
            const res = await fetch('/api/magic-links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dealId,
                    openItemIds: selectedItems,
                    clientEmail: clientEmail || null,
                    expiresInDays: 7
                })
            })

            const data = await res.json()

            if (data.success) {
                setGeneratedLink(data.link.portalUrl)
                toast.success('Magic link generated!')
            } else {
                toast.error(data.error || 'Failed to generate link')
            }
        } catch (error) {
            console.error('Error generating link:', error)
            toast.error('Failed to generate link')
        } finally {
            setGeneratingLink(false)
        }
    }

    async function handleSendEmail() {
        if (selectedItems.length === 0) {
            toast.error('Select at least one item')
            return
        }

        if (!clientEmail?.trim()) {
            toast.error('Client email is required')
            return
        }

        try {
            setSendingEmail(true)
            const res = await fetch('/api/send-portal-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dealId,
                    openItemIds: selectedItems,
                    clientEmail,
                    clientName: clientName || null,
                    expiresInDays: 7
                })
            })

            const data = await res.json()

            if (data.success) {
                setGeneratedLink(data.link.portalUrl)
                setEmailSent(data.emailSent)
                if (data.emailSent) {
                    toast.success(`Email sent to ${clientEmail}!`)
                } else {
                    toast.warning('Link created but email failed. You can copy it manually.')
                }
                fetchItems() // Refresh to show updated status
            } else {
                toast.error(data.error || 'Failed to send email')
            }
        } catch (error) {
            console.error('Error sending email:', error)
            toast.error('Failed to send email')
        } finally {
            setSendingEmail(false)
        }
    }

    function copyLink() {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink)
            toast.success('Link copied to clipboard!')
        }
    }

    // Filter items
    const filteredItems = items.filter(item => {
        if (filter === 'all') return true
        if (filter === 'pending') return item.status === 'pending' && !item.isResolved
        if (filter === 'responded') return item.status === 'responded' && !item.isResolved
        if (filter === 'resolved') return item.isResolved
        return true
    })

    // Calculate stats
    const stats = {
        total: items.length,
        pending: items.filter(i => i.status === 'pending' && !i.isResolved).length,
        responded: items.filter(i => i.status === 'responded' && !i.isResolved).length,
        resolved: items.filter(i => i.isResolved).length
    }

    const getPriorityConfig = (priority: number) => {
        if (priority >= 8) {
            return {
                icon: AlertCircle,
                badge: 'High Priority',
                bgClass: 'bg-red-50',
                borderClass: 'border-l-red-500',
                badgeClass: 'bg-red-100 text-red-800 border-red-200',
                iconColor: 'text-red-600',
            }
        }
        if (priority >= 5) {
            return {
                icon: AlertTriangle,
                badge: 'Medium Priority',
                bgClass: 'bg-amber-50',
                borderClass: 'border-l-amber-500',
                badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
                iconColor: 'text-amber-600',
            }
        }
        return {
            icon: Info,
            badge: 'Low Priority',
            bgClass: 'bg-gray-50',
            borderClass: 'border-l-gray-500',
            badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
            iconColor: 'text-gray-600',
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-6">
                <Card className="p-6 border-l-4 border-l-primary">
                    <div className="flex items-center gap-3 mb-2">
                        <Flag className="w-10 h-10 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                    <div className="text-xs font-medium text-muted-foreground">Total Open Items</div>
                </Card>

                <Card className="p-6 border-l-4 border-l-amber-500 bg-amber-50/20">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-10 h-10 text-amber-600" />
                    </div>
                    <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
                    <div className="text-xs font-medium text-muted-foreground">Pending Response</div>
                </Card>

                <Card className="p-6 border-l-4 border-l-blue-500 bg-blue-50/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Send className="w-10 h-10 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-blue-600">{stats.responded}</div>
                    <div className="text-xs font-medium text-muted-foreground">Client Responded</div>
                </Card>

                <Card className="p-6 border-l-4 border-l-green-500 bg-green-50/20">
                    <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
                    <div className="text-xs font-medium text-muted-foreground">Resolved</div>
                </Card>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button
                        variant={filter === 'all' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('all')}
                    >
                        All ({stats.total})
                    </Button>
                    <Button
                        variant={filter === 'pending' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('pending')}
                    >
                        Pending ({stats.pending})
                    </Button>
                    <Button
                        variant={filter === 'responded' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('responded')}
                    >
                        Responded ({stats.responded})
                    </Button>
                    <Button
                        variant={filter === 'resolved' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilter('resolved')}
                    >
                        Resolved ({stats.resolved})
                    </Button>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setShowCreateDialog(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            if (selectedItems.length === 0) {
                                // Select all pending items
                                setSelectedItems(items.filter(i => !i.isResolved).map(i => i.id))
                            }
                            setShowLinkDialog(true)
                        }}
                        disabled={items.filter(i => !i.isResolved).length === 0}
                    >
                        <Link className="w-4 h-4 mr-2" />
                        Send to Client
                    </Button>
                </div>
            </div>

            {/* Open Items List */}
            {filteredItems.length === 0 ? (
                <Card className="p-12 text-center">
                    <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No Open Items</h3>
                    <p className="text-muted-foreground mt-1">
                        {filter === 'all'
                            ? 'Create questions to send to your client for clarification.'
                            : `No ${filter} items found.`
                        }
                    </p>
                    {filter === 'all' && (
                        <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create First Question
                        </Button>
                    )}
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredItems.map((item) => {
                        const config = getPriorityConfig(item.priority)
                        const Icon = config.icon
                        const isSelected = selectedItems.includes(item.id)

                        return (
                            <Card key={item.id} className={`border-l-4 ${config.borderClass} ${config.bgClass}/30`}>
                                <div className="p-6 space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedItems([...selectedItems, item.id])
                                                    } else {
                                                        setSelectedItems(selectedItems.filter(id => id !== item.id))
                                                    }
                                                }}
                                                disabled={item.isResolved}
                                            />
                                            <Badge className={config.badgeClass} variant="outline">
                                                <Icon className="w-3 h-3 mr-1" />
                                                {config.badge}
                                            </Badge>
                                            {item.isResolved && (
                                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    Resolved
                                                </Badge>
                                            )}
                                            {item.status === 'responded' && !item.isResolved && (
                                                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                                    <Send className="w-3 h-3 mr-1" />
                                                    Client Responded
                                                </Badge>
                                            )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleResolve(item.id, item.isResolved)}
                                                >
                                                    {item.isResolved ? 'Reopen Item' : 'Mark as Resolved'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Linked Anomaly */}
                                    {item.anomaly && (
                                        <Card className="p-4 bg-muted">
                                            <div className="text-xs font-medium text-muted-foreground uppercase mb-1">
                                                Related Anomaly
                                            </div>
                                            <div className="text-sm font-medium">{item.anomaly.title}</div>
                                            {item.anomaly.description && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    {item.anomaly.description}
                                                </div>
                                            )}
                                        </Card>
                                    )}

                                    {/* Question */}
                                    <div className="space-y-2">
                                        <div className="text-xs font-medium text-muted-foreground uppercase">
                                            Question for Client
                                        </div>
                                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                                            <p className="text-sm text-foreground leading-relaxed">
                                                {item.question}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Context */}
                                    {item.context && (
                                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                            <span className="font-medium">Context:</span> {item.context}
                                        </div>
                                    )}

                                    {/* Client Response (if any) */}
                                    {item.clientResponse && (
                                        <div className="space-y-2">
                                            <div className="text-xs font-medium text-muted-foreground uppercase">
                                                Client Response
                                                {item.respondedAt && (
                                                    <span className="font-normal ml-2">
                                                        ({new Date(item.respondedAt).toLocaleDateString()})
                                                    </span>
                                                )}
                                            </div>
                                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                                                <p className="text-sm text-foreground">{item.clientResponse}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t text-xs text-muted-foreground">
                                        <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                                        {item.isResolved && item.resolvedBy && (
                                            <span>Resolved by: {item.resolvedBy}</span>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
                <Button variant="outline" onClick={() => onNavigate('mapper')}>
                    Back to Mapping
                </Button>
                <Button onClick={() => onNavigate('report-preview')}>
                    Generate Reports
                </Button>
            </div>

            {/* Create Item Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Open Item</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Question *</label>
                            <Textarea
                                placeholder="What question do you need the client to answer?"
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Context (Optional)</label>
                            <Textarea
                                placeholder="Additional context or background info..."
                                value={newContext}
                                onChange={(e) => setNewContext(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Priority (1-10)</label>
                            <Input
                                type="number"
                                min={1}
                                max={10}
                                value={newPriority}
                                onChange={(e) => setNewPriority(parseInt(e.target.value) || 5)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={!newQuestion.trim() || creating}>
                            {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Send to Client Dialog */}
            <Dialog open={showLinkDialog} onOpenChange={(open) => {
                setShowLinkDialog(open)
                if (!open) {
                    setGeneratedLink(null)
                    setClientEmail('')
                    setClientName('')
                    setEmailSent(false)
                }
            }}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {generatedLink ? (
                                <><CheckCircle className="w-5 h-5 text-green-600" /> {emailSent ? 'Email Sent!' : 'Link Ready!'}</>
                            ) : (
                                <><Send className="w-5 h-5" /> Send to Client</>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    {!generatedLink ? (
                        <>
                            <div className="space-y-4 py-4">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                                        <Mail className="w-4 h-4" />
                                        {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                                    </div>
                                    <p className="text-sm text-blue-700">
                                        Your client will receive a secure link to respond to these questions.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Client Email *</label>
                                    <Input
                                        type="email"
                                        placeholder="client@company.com"
                                        value={clientEmail}
                                        onChange={(e) => setClientEmail(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Client Name (Optional)</label>
                                    <Input
                                        type="text"
                                        placeholder="John Smith"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Used to personalize the email greeting
                                    </p>
                                </div>
                            </div>
                            <DialogFooter className="flex-col sm:flex-row gap-2">
                                <Button variant="outline" onClick={() => setShowLinkDialog(false)} className="sm:mr-auto">
                                    Cancel
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleGenerateLink}
                                    disabled={generatingLink || sendingEmail}
                                >
                                    {generatingLink ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Link className="w-4 h-4 mr-2" />}
                                    Just Generate Link
                                </Button>
                                <Button
                                    onClick={handleSendEmail}
                                    disabled={!clientEmail?.trim() || sendingEmail || generatingLink}
                                >
                                    {sendingEmail ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                                    Send Email
                                </Button>
                            </DialogFooter>
                        </>
                    ) : (
                        <>
                            <div className="space-y-4 py-4">
                                {emailSent ? (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2 text-green-800 font-medium mb-2">
                                            <Mail className="w-5 h-5" />
                                            Email Delivered
                                        </div>
                                        <p className="text-sm text-green-700">
                                            The portal link has been sent to <strong>{clientEmail}</strong>.
                                            The link expires in 7 days.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <div className="flex items-center gap-2 text-amber-800 font-medium mb-2">
                                            <Link className="w-5 h-5" />
                                            Link Generated
                                        </div>
                                        <p className="text-sm text-amber-700">
                                            Copy the link below and send it to your client manually.
                                            The link expires in 7 days.
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Portal Link</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={generatedLink}
                                            readOnly
                                            className="font-mono text-xs"
                                        />
                                        <Button variant="outline" onClick={copyLink}>
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        You can also copy this link to share via other channels
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => {
                                    setShowLinkDialog(false)
                                    setGeneratedLink(null)
                                    setClientEmail('')
                                    setClientName('')
                                    setSelectedItems([])
                                    setEmailSent(false)
                                }}>
                                    Done
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
