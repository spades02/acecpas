"use client"

import { useState } from "react";
import { CheckCircle, AlertTriangle, HelpCircle, Download, Check, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface MapperScreenProps {
    onNavigate: (page: string) => void;
}

interface MappingRow {
    id: string;
    originalAccount: string;
    description: string;
    sampleTransactions: string;
    mappedTo: string;
    confidence: number;
    status: 'auto-approved' | 'needs-review' | 'unmapped';
}

export function MapperScreen({ onNavigate }: MapperScreenProps) {
    const [selectedRow, setSelectedRow] = useState<MappingRow | null>(null);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [activeFilter, setActiveFilter] = useState<string>('all');

    const mappings: MappingRow[] = [
        {
            id: '1',
            originalAccount: '6200 - Office Supplies',
            description: 'Paper, pens, toner, etc.',
            sampleTransactions: 'Staples, Office Depot',
            mappedTo: 'Office Expenses',
            confidence: 96,
            status: 'auto-approved',
        },
        {
            id: '2',
            originalAccount: '8750 - Misc Expense',
            description: 'Various purchases',
            sampleTransactions: 'Amazon, Walmart',
            mappedTo: 'Office Supplies?',
            confidence: 72,
            status: 'needs-review',
        },
        {
            id: '3',
            originalAccount: 'Account 9999',
            description: '',
            sampleTransactions: '',
            mappedTo: '',
            confidence: 15,
            status: 'unmapped',
        },
        {
            id: '4',
            originalAccount: '4100 - Professional Fees',
            description: 'Consulting and advisory',
            sampleTransactions: 'McKinsey, Deloitte',
            mappedTo: 'Professional Services',
            confidence: 94,
            status: 'auto-approved',
        },
        {
            id: '5',
            originalAccount: '5200 - Travel & Entertainment',
            description: 'Business travel expenses',
            sampleTransactions: 'United Airlines, Marriott',
            mappedTo: 'Travel Expenses',
            confidence: 91,
            status: 'auto-approved',
        },
    ];

    const getConfidenceBadge = (confidence: number) => {
        if (confidence >= 90) {
            return <Badge className="bg-green-100 text-green-800 border-green-200">{confidence}%</Badge>;
        } else if (confidence >= 70) {
            return <Badge className="bg-amber-100 text-amber-800 border-amber-200">{confidence}%</Badge>;
        } else {
            return <Badge className="bg-red-100 text-red-800 border-red-200">{confidence}%</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        if (status === 'auto-approved') return <div className="w-2 h-2 bg-green-500 rounded-full" />;
        if (status === 'needs-review') return <div className="w-2 h-2 bg-amber-500 rounded-full" />;
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
    };

    const stats = {
        autoMapped: mappings.filter(m => m.status === 'auto-approved').length,
        needsReview: mappings.filter(m => m.status === 'needs-review').length,
        unmapped: mappings.filter(m => m.status === 'unmapped').length,
    };

    return (
        <div className="h-[calc(100vh-14rem)] flex flex-col">
            {/* Stats Header */}
            <div className="bg-white border-b border-border p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span>All changes saved • Last saved 2:45 PM</span>
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
                                <Badge className="bg-green-100 text-green-800 text-xs mt-1 border-green-200">High Confidence (&gt;90%)</Badge>
                                <div className="text-xs text-muted-foreground mt-1">Ready to approve</div>
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
                                <Badge className="bg-amber-100 text-amber-800 text-xs mt-1 border-amber-200">Low Confidence (&lt;90%)</Badge>
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
            <div className="bg-white border-b border-border px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left - Filters */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
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
                                High Confidence ({stats.autoMapped})
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
                        </div>

                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search accounts..."
                                className="pl-9 w-80 bg-muted"
                            />
                        </div>
                    </div>

                    {/* Right - Actions */}
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export to Excel
                        </Button>
                        <Button size="sm">
                            Auto-Approve All High Confidence
                        </Button>
                    </div>
                </div>
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
                                    Sample Transactions
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
                            {mappings.map((mapping) => (
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
                                                    setSelectedRows([...selectedRows, mapping.id]);
                                                } else {
                                                    setSelectedRows(selectedRows.filter(id => id !== mapping.id));
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
                                        <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                                            {mapping.sampleTransactions || <span className="text-gray-300">—</span>}
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
                                        {getConfidenceBadge(mapping.confidence)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {mapping.status === 'auto-approved' ? (
                                            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                                                <Check className="w-4 h-4" /> Approved
                                            </span>
                                        ) : mapping.status === 'needs-review' ? (
                                            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                                                Review
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
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
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{stats.needsReview + stats.unmapped} items need review before proceeding</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">Page 1 of 20</div>
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
                <SheetContent className="w-[400px] overflow-y-auto">
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
                                        <div className="text-lg font-bold text-foreground">{selectedRow.originalAccount.split(' - ')[0]}</div>
                                        <div className="font-medium text-foreground mt-1">{selectedRow.originalAccount.split(' - ')[1] || 'No name'}</div>
                                        {selectedRow.description && (
                                            <div className="text-sm text-muted-foreground mt-2">{selectedRow.description}</div>
                                        )}
                                    </Card>
                                </div>

                                {/* Sample Transactions */}
                                {selectedRow.sampleTransactions && (
                                    <div className="space-y-2">
                                        <div className="text-xs font-medium text-muted-foreground uppercase">Recent Transactions</div>
                                        <Card className="divide-y">
                                            {selectedRow.sampleTransactions.split(', ').map((vendor, i) => (
                                                <div key={i} className="p-3 bg-muted">
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-medium text-sm">{vendor}</div>
                                                        <div className="text-sm font-bold">${(Math.random() * 1000).toFixed(2)}</div>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground mt-1">
                                                        {new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </Card>
                                    </div>
                                )}

                                {/* AI Recommendation */}
                                {selectedRow.mappedTo && (
                                    <Card className="p-5 bg-blue-50 border-blue-200">
                                        <div className="flex items-start gap-3 mb-4">
                                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-lg">
                                                🤖
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-primary">AI Suggested Mapping</div>
                                                <div className="text-xl font-bold text-foreground mt-2">{selectedRow.mappedTo.replace('?', '')}</div>
                                            </div>
                                            <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                                                <div className="text-lg font-bold text-amber-800">{selectedRow.confidence}%</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-xs font-medium text-muted-foreground uppercase">Why This Mapping?</div>
                                            <div className="bg-white p-3 rounded-lg text-sm text-foreground leading-relaxed">
                                                Based on 23 similar mappings from historical data. Keywords matched: 'supplies', 'office'.
                                                This category is commonly used for operational expenses.
                                            </div>
                                        </div>
                                    </Card>
                                )}

                                {/* Actions */}
                                <div className="space-y-3">
                                    <Button className="w-full" size="lg">
                                        Approve AI Suggestion
                                    </Button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" size="sm">Reject & Skip</Button>
                                        <Button variant="ghost" size="sm">Cancel</Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
