"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { CheckCircle, FileText, Lock, AlertCircle, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { FileUpload } from "@/components/ui/file-upload"

interface OpenItem {
    id: string
    question: string
    context: string | null
    priority: number
    status: string
    clientResponse: string | null
    respondedAt: string | null
    isResolved: boolean
    anomaly?: {
        id: string
        title: string
        description: string
        detected_value: string
        anomaly_type: string
    } | null
}

interface PortalData {
    token: string
    expiresAt: string
    clientEmail: string | null
    deal: {
        id: string
        name: string
        clientName: string
    } | null
    organization: {
        id: string
        name: string
    } | null
    items: OpenItem[]
}

export default function ClientPortalPage() {
    const params = useParams()
    const token = params.token as string

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [portal, setPortal] = useState<PortalData | null>(null)
    const [responses, setResponses] = useState<Record<string, string>>({})
    const [submitting, setSubmitting] = useState<string | null>(null)
    const [submitted, setSubmitted] = useState<string[]>([])

    // Fetch portal data on mount
    useEffect(() => {
        async function fetchPortal() {
            try {
                const res = await fetch(`/api/portal/${token}`)
                const data = await res.json()

                if (!res.ok) {
                    setError(data.error || 'Failed to load portal')
                    return
                }

                setPortal(data.portal)

                // Pre-fill responses for items that already have responses
                const existingResponses: Record<string, string> = {}
                const alreadySubmitted: string[] = []
                data.portal.items.forEach((item: OpenItem) => {
                    if (item.clientResponse) {
                        existingResponses[item.id] = item.clientResponse
                        alreadySubmitted.push(item.id)
                    }
                })
                setResponses(existingResponses)
                setSubmitted(alreadySubmitted)

            } catch (err) {
                console.error('Portal fetch error:', err)
                setError('Unable to connect to the server')
            } finally {
                setLoading(false)
            }
        }

        if (token) {
            fetchPortal()
        }
    }, [token])

    // Submit a response
    async function handleSubmit(itemId: string) {
        const response = responses[itemId]
        if (!response?.trim()) return

        setSubmitting(itemId)

        try {
            const res = await fetch(`/api/portal/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, response })
            })

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || 'Failed to submit response')
                return
            }

            setSubmitted([...submitted, itemId])

        } catch (err) {
            console.error('Submit error:', err)
            alert('Failed to submit response. Please try again.')
        } finally {
            setSubmitting(null)
        }
    }

    // Calculate progress
    const totalItems = portal?.items.length || 0
    const completedCount = submitted.length
    const progressPercent = totalItems > 0 ? (completedCount / totalItems) * 100 : 0

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading your portal...</p>
                </div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full p-8 text-center space-y-4">
                    <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                    <h1 className="text-xl font-semibold">Unable to Access Portal</h1>
                    <p className="text-muted-foreground">{error}</p>
                    <p className="text-sm text-muted-foreground">
                        If you believe this is an error, please contact your CPA firm for assistance.
                    </p>
                </Card>
            </div>
        )
    }

    if (!portal) return null

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                            {portal.organization?.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                            <div className="text-lg font-semibold">{portal.organization?.name || 'AceCPAs'}</div>
                            <div className="text-xs text-muted-foreground">Open Items Response Portal</div>
                        </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Lock className="w-3 h-3 mr-1" />
                        Secure Link
                    </Badge>
                </div>
            </div>

            {/* Deal Context Banner */}
            <div className="bg-blue-50 border-b border-blue-200">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <h1 className="text-lg font-semibold text-foreground mb-1">
                        {portal.deal?.clientName} - {portal.deal?.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Link expires: <span className="font-medium text-foreground">
                            {new Date(portal.expiresAt).toLocaleDateString('en-US', {
                                month: 'long', day: 'numeric', year: 'numeric'
                            })}
                        </span>
                    </p>
                </div>
            </div>

            {/* Instructions */}
            <div className="max-w-5xl mx-auto px-6 py-6">
                <Card className="p-6 bg-blue-50 border-blue-200">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-foreground mb-2">
                                Welcome{portal.clientEmail ? `, ${portal.clientEmail}` : ''}
                            </h2>
                            <p className="text-sm text-foreground mb-3 leading-relaxed">
                                Please review and respond to the following questions about your financial records.
                                You can upload supporting documents for each item if needed.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Your responses will be securely transmitted to your CPA firm.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Progress */}
            <div className="max-w-5xl mx-auto px-6 pb-6">
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                            Progress: {completedCount} of {totalItems} items completed
                        </span>
                        <span className="text-sm font-medium text-primary">{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                </Card>
            </div>

            {/* Open Items */}
            <div className="max-w-5xl mx-auto px-6 pb-12 space-y-6">
                {portal.items.map((item) => {
                    const isCompleted = submitted.includes(item.id)
                    const isSubmitting = submitting === item.id

                    const getPriorityColor = () => {
                        if (item.priority >= 8) return 'border-l-red-500 bg-red-50/30'
                        if (item.priority >= 5) return 'border-l-amber-500 bg-amber-50/30'
                        return 'border-l-gray-500 bg-gray-50/30'
                    }

                    return (
                        <Card key={item.id} className={`border-l-4 ${getPriorityColor()}`}>
                            <div className="p-6 space-y-4">
                                {/* Status Badge */}
                                <div className="flex items-center justify-between">
                                    <Badge className={
                                        isCompleted
                                            ? 'bg-green-100 text-green-800 border-green-200'
                                            : 'bg-amber-100 text-amber-800 border-amber-200'
                                    }>
                                        {isCompleted ? (
                                            <>
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Submitted
                                            </>
                                        ) : (
                                            'Pending'
                                        )}
                                    </Badge>
                                    <Badge variant="outline">
                                        Priority: {item.priority}/10
                                    </Badge>
                                </div>

                                {/* Anomaly Context (if linked) */}
                                {item.anomaly && (
                                    <Card className="p-4 bg-muted">
                                        <div className="text-sm font-medium">{item.anomaly.title}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{item.anomaly.description}</div>
                                        {item.anomaly.detected_value && (
                                            <div className="text-xs text-muted-foreground mt-2">
                                                Detected: {item.anomaly.detected_value}
                                            </div>
                                        )}
                                    </Card>
                                )}

                                {/* Question */}
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-muted-foreground uppercase">Question from Your CPA</div>
                                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                                        <p className="text-sm text-foreground leading-relaxed">{item.question}</p>
                                    </div>
                                </div>

                                {/* Context */}
                                {item.context && (
                                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                        <span className="font-medium">Additional Context:</span> {item.context}
                                    </div>
                                )}

                                {/* Response Area */}
                                {!isCompleted ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase">Your Response *</label>
                                            <Textarea
                                                placeholder="Type your response here... Be specific and include relevant details."
                                                className="min-h-[120px]"
                                                value={responses[item.id] || ''}
                                                onChange={(e) => setResponses({ ...responses, [item.id]: e.target.value })}
                                                disabled={isSubmitting}
                                            />
                                            <div className="text-xs text-muted-foreground text-right">
                                                {(responses[item.id] || '').length} / 2000 characters
                                            </div>
                                        </div>

                                        {/* File Upload */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-muted-foreground uppercase">
                                                Upload Supporting Documents (Optional)
                                            </label>
                                            <FileUpload
                                                token={token}
                                                itemId={item.id}
                                                maxFiles={5}
                                            />
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                                            <Button
                                                onClick={() => handleSubmit(item.id)}
                                                disabled={!responses[item.id]?.trim() || isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    'Submit Response'
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Completed Response (Read-only) */}
                                        <div className="space-y-2">
                                            <div className="text-xs font-medium text-muted-foreground uppercase">Your Response</div>
                                            <div className="bg-green-50 border border-green-200 p-4 rounded">
                                                <p className="text-sm text-foreground">{responses[item.id]}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4 border-t">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSubmitted(submitted.filter(id => id !== item.id))}
                                            >
                                                Edit Response
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="bg-muted text-center py-6 text-xs text-muted-foreground space-y-1">
                <div>Powered by {portal.organization?.name || 'AceCPAs'} - Secure Document Portal</div>
                <div className="flex items-center justify-center gap-1 text-green-600">
                    <Lock className="w-3 h-3" />
                    <span>Your data is encrypted and secure</span>
                </div>
            </div>
        </div>
    )
}
