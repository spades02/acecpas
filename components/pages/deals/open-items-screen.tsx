"use client"

import { AlertCircle, AlertTriangle, Info, Flag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface OpenItemsScreenProps {
    dealId: string;
    onNavigate: (page: string) => void;
}

export function OpenItemsScreen({ dealId, onNavigate }: OpenItemsScreenProps) {
    const openItems = [
        {
            id: '1',
            priority: 'high',
            date: 'March 15, 2024',
            amount: '$8,450.00',
            vendor: 'Ferrari of Denver',
            category: 'Auto Expense',
            description: 'Vehicle lease payment',
            issues: [
                { type: 'warning', label: 'Potential Personal Use', detail: 'Unusual vendor for business category' },
                { type: 'info', label: 'Outlier Detection', detail: '450% above monthly average for this category' },
            ],
            question: 'Please confirm the business purpose of this vehicle expense and provide supporting documentation (lease agreement, business use log).',
        },
        {
            id: '2',
            priority: 'medium',
            date: 'April 3, 2024',
            amount: '$2,150.00',
            vendor: 'Best Buy',
            category: 'Equipment',
            description: 'Consumer electronics purchase',
            issues: [
                { type: 'warning', label: 'Personal Use Keywords Detected', detail: 'Consumer electronics vendor commonly flagged' },
            ],
            question: 'Please clarify if this equipment purchase was for business use and specify the item(s) purchased.',
        },
        {
            id: '3',
            priority: 'low',
            date: 'Feb 12, 2024',
            amount: '$180.00',
            vendor: 'Venmo Transfer',
            category: 'Reimbursements',
            description: 'Digital payment',
            issues: [
                { type: 'info', label: 'Informal Payment Method', detail: 'Venmo detected - may need documentation' },
            ],
            question: 'Please provide details on this reimbursement: who was paid and for what business expense?',
        },
    ];

    const getPriorityConfig = (priority: string) => {
        const configs = {
            high: {
                icon: AlertCircle,
                badge: 'High Priority',
                bgClass: 'bg-red-50',
                borderClass: 'border-l-red-500',
                badgeClass: 'bg-red-100 text-red-800 border-red-200',
                iconColor: 'text-red-600',
            },
            medium: {
                icon: AlertTriangle,
                badge: 'Medium Priority',
                bgClass: 'bg-amber-50',
                borderClass: 'border-l-amber-500',
                badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
                iconColor: 'text-amber-600',
            },
            low: {
                icon: Info,
                badge: 'Low Priority',
                bgClass: 'bg-gray-50',
                borderClass: 'border-l-gray-500',
                badgeClass: 'bg-gray-100 text-gray-800 border-gray-200',
                iconColor: 'text-gray-600',
            },
        };
        return configs[priority as keyof typeof configs] || configs.low;
    };

    const stats = {
        total: 37,
        high: 8,
        medium: 21,
        low: 8,
    };

    return (
        <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-6">
                <Card className="p-6 border-l-4 border-l-primary">
                    <div className="flex items-center gap-3 mb-2">
                        <Flag className="w-10 h-10 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                    <div className="text-xs font-medium text-muted-foreground">Items Flagged for Review</div>
                </Card>

                <Card className="p-6 border-l-4 border-l-red-500 bg-red-50/20">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <div className="text-3xl font-bold text-red-600">{stats.high}</div>
                    <div className="text-xs font-medium text-muted-foreground">Urgent - Material Amounts</div>
                </Card>

                <Card className="p-6 border-l-4 border-l-amber-500 bg-amber-50/20">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-10 h-10 text-amber-600" />
                    </div>
                    <div className="text-3xl font-bold text-amber-600">{stats.medium}</div>
                    <div className="text-xs font-medium text-muted-foreground">Review Recommended</div>
                </Card>

                <Card className="p-6 border-l-4 border-l-gray-500 bg-gray-50/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Info className="w-10 h-10 text-gray-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-600">{stats.low}</div>
                    <div className="text-xs font-medium text-muted-foreground">Optional Clarification</div>
                </Card>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="default" size="sm">All ({stats.total})</Button>
                    <Button variant="ghost" size="sm">High ({stats.high})</Button>
                    <Button variant="ghost" size="sm">Medium ({stats.medium})</Button>
                    <Button variant="ghost" size="sm">Low ({stats.low})</Button>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">Export to Excel</Button>
                    <Button size="sm">Send to Client</Button>
                </div>
            </div>

            {/* Open Items List */}
            <div className="space-y-4">
                {openItems.map((item) => {
                    const config = getPriorityConfig(item.priority);
                    const Icon = config.icon;

                    return (
                        <Card key={item.id} className={`border-l-4 ${config.borderClass} ${config.bgClass}/30`}>
                            <div className="p-6 space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <Badge className={config.badgeClass} variant="outline">
                                        <Icon className="w-3 h-3 mr-1" />
                                        {config.badge}
                                    </Badge>
                                    <Checkbox />
                                </div>

                                {/* Transaction Details */}
                                <Card className="p-4 bg-muted">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm font-medium text-foreground">{item.date}</div>
                                            <div className="text-sm text-muted-foreground mt-1">Vendor: {item.vendor}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-foreground">{item.amount}</div>
                                            <Badge variant="outline" className="mt-1">{item.category}</Badge>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-3">{item.description}</div>
                                </Card>

                                {/* Detected Issues */}
                                <div className="space-y-2">
                                    {item.issues.map((issue, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            {issue.type === 'warning' ? (
                                                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                                            ) : (
                                                <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                                            )}
                                            <div>
                                                <div className={`text-sm font-medium ${issue.type === 'warning' ? 'text-amber-800' : 'text-blue-800'}`}>
                                                    {issue.label}
                                                </div>
                                                <div className="text-xs text-muted-foreground">{issue.detail}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* AI-Generated Question */}
                                <div className="space-y-2">
                                    <div className="text-xs font-medium text-muted-foreground uppercase">Question for Client</div>
                                    <Textarea
                                        value={item.question}
                                        className="min-h-[80px] bg-white"
                                        readOnly
                                    />
                                    <div className="text-xs text-muted-foreground text-right">
                                        {item.question.length} characters
                                    </div>
                                </div>

                                {/* Action Bar */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" size="sm">Edit Question</Button>
                                        <Button variant="link" size="sm" className="text-red-600">Remove from List</Button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox id={`resolve-${item.id}`} />
                                        <label htmlFor={`resolve-${item.id}`} className="text-sm cursor-pointer">
                                            Mark as Resolved
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
                <Button variant="outline" onClick={() => onNavigate('mapper')}>
                    Back to Mapping
                </Button>
                <Button onClick={() => onNavigate('report-preview')}>
                    Generate Reports
                </Button>
            </div>
        </div>
    );
}
