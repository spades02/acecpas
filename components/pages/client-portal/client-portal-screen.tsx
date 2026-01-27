"use client"

import { useState } from "react";
import { CheckCircle, Upload, FileText, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { MOCK_QUESTIONS } from "./data";

export function ClientPortalScreen() {
    const [responses, setResponses] = useState<Record<string, string>>({});
    const [completed, setCompleted] = useState<string[]>([]);
    const questions = MOCK_QUESTIONS;

    const completedCount = completed.length;
    const totalCount = questions.length;
    const progressPercent = (completedCount / totalCount) * 100;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - No Sidebar */}
            <div className="bg-white border-b shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                            AC
                        </div>
                        <div>
                            <div className="text-lg font-semibold">AceCPAs</div>
                            <div className="text-xs text-muted-foreground">Open Items Response Portal</div>
                        </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Lock className="w-3 h-3 mr-1" />
                        Secure Link
                    </Badge>
                </div>
            </div>

            {/* Client Context Banner */}
            <div className="bg-blue-50 border-b border-blue-200">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <h1 className="text-lg font-semibold text-foreground mb-1">
                        Acme Corp - Q3 2024 Quality of Earnings Review
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Please respond by: <span className="font-medium text-foreground">December 15, 2024</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Questions? Contact Sarah Chen at sarah@acmecpas.com
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
                            <h2 className="text-lg font-semibold text-foreground mb-2">Welcome, John Smith</h2>
                            <p className="text-sm text-foreground mb-3 leading-relaxed">
                                Please review and respond to the following questions about your financial records.
                                You can upload supporting documents (receipts, invoices, etc.) for each item.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Your responses will be securely transmitted to your CPA firm.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Progress Indicator */}
            <div className="max-w-5xl mx-auto px-6 pb-6">
                <Card className="p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                            Progress: {completedCount} of {totalCount} items completed
                        </span>
                        <span className="text-sm font-medium text-primary">{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                </Card>
            </div>

            {/* Response Forms */}
            <div className="max-w-5xl mx-auto px-6 pb-12 space-y-6">
                {questions.map((item) => {
                    const isCompleted = completed.includes(item.id);
                    const getPriorityColor = () => {
                        if (item.priority === 'high') return 'border-l-red-500 bg-red-50/30';
                        if (item.priority === 'medium') return 'border-l-amber-500 bg-amber-50/30';
                        return 'border-l-gray-500 bg-gray-50/30';
                    };

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
                                </div>

                                {/* Transaction Summary */}
                                <Card className="p-4 bg-muted">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium">{item.date}</div>
                                            <div className="text-sm text-muted-foreground mt-1">Vendor: {item.vendor}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold">{item.amount}</div>
                                            <Badge variant="outline" className="mt-1">{item.category}</Badge>
                                        </div>
                                    </div>
                                </Card>

                                {/* Question */}
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-muted-foreground uppercase">Question from Your CPA</div>
                                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                                        <p className="text-sm text-foreground leading-relaxed">{item.question}</p>
                                    </div>
                                </div>

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
                                            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                                                <Upload className="w-8 h-8 text-primary mx-auto mb-2" />
                                                <div className="text-sm font-medium">Drag files here or click to browse</div>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    PDF, Excel, Images supported (Max 10MB per file)
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-3 pt-4 border-t">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    // Save draft logic
                                                }}
                                            >
                                                Save Draft
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    if (responses[item.id]?.trim()) {
                                                        setCompleted([...completed, item.id]);
                                                    }
                                                }}
                                                disabled={!responses[item.id]?.trim()}
                                            >
                                                Submit Response
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
                                                onClick={() => {
                                                    setCompleted(completed.filter(id => id !== item.id));
                                                }}
                                            >
                                                Edit Response
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Bottom Action Bar */}
            <div className="sticky bottom-0 bg-white border-t shadow-lg">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Button variant="outline">
                        Save All Drafts
                    </Button>
                    <Button
                        size="lg"
                        disabled={completedCount !== totalCount}
                    >
                        Submit All Responses
                    </Button>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-muted text-center py-6 text-xs text-muted-foreground space-y-1">
                <div>Need help? Contact Sarah Chen at sarah@acmecpas.com</div>
                <div>Powered by AceCPAs - Secure Document Portal</div>
                <div className="flex items-center justify-center gap-1 text-green-600">
                    <Lock className="w-3 h-3" />
                    <span>Your data is encrypted and secure</span>
                </div>
            </div>
        </div>
    );
}
