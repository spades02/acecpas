"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { FilesTab } from "./files-tab"
import { MapperScreen } from "./mapper-screen"
import { Briefcase, Calendar, Check, DollarSign, Clock, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BackButton } from "@/components/ui/back-button"
import { OpenItemsScreen } from "./open-items-screen"

// Define proper type for Deal
interface DealDetail {
    id: string
    name: string
    client_name: string
    deal_type: string
    status: string
    progress: number
    target_close_date: string | null
    updated_at: string

    // Nested relations
    files?: any[]
    assigned_user?: { full_name: string }
}

interface DealViewProps {
    deal: DealDetail
}

export function DealView({ deal }: DealViewProps) {
    const [view, setView] = useState('files');

    const handleNavigate = (page: string) => {
        setView(page);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">

            {/* --- TOP HEADER: Breadcrumb & Meta --- */}
            <div className="bg-white border-b border-border p-6 pb-4">
                <div className="flex items-center gap-2 mb-4">
                    <BackButton fallbackRoute="/deals/all-deals" />
                </div>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            {deal.name}
                            <Badge variant="outline" className="text-base font-normal capitalize">{deal.status}</Badge>
                        </h1>
                        <div className="text-muted-foreground flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {deal.client_name}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Updated: {new Date(deal.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span>All changes saved</span>
                    </div>
                </div>

                {/* --- STATS GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

                    {/* Card 1: Deal Type */}
                    <Card className="p-5 border-l-4 border-l-green-600 bg-green-50/30">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xl font-bold text-foreground truncate">
                                    {deal.deal_type}
                                </div>
                                <Badge className="bg-green-100 text-green-800 text-xs mt-1 border-green-200">Deal Type</Badge>
                            </div>
                        </div>
                    </Card>

                    {/* Card 2: Progress */}
                    <Card className="p-5 border-l-4 border-l-amber-500 bg-amber-50/30">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-2xl font-bold text-foreground">
                                    {deal.progress}%
                                </div>
                                <Badge className="bg-amber-100 text-amber-800 text-xs mt-1 border-amber-200">Completion</Badge>
                            </div>
                        </div>
                    </Card>

                    {/* Card 3: Target Close */}
                    <Card className="p-5 border-l-4 border-l-blue-500 bg-blue-50/30">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <div className="text-xl font-bold text-foreground">
                                    {deal.target_close_date ? new Date(deal.target_close_date).toLocaleDateString() : 'TBD'}
                                </div>
                                <Badge className="bg-blue-100 text-blue-800 text-xs mt-1 border-blue-200">Target Close</Badge>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* --- CONTENT AREA (Managed by 'view' State) --- */}
            <div className="flex-1 bg-slate-50/50 p-6 w-full">

                {view === 'files' && (
                    <FilesTab dealId={deal.id} onNavigate={handleNavigate} />
                )}

                {view === 'mapper' && (
                    <MapperScreen dealId={deal.id} onNavigate={handleNavigate} />
                )}

                {view === 'open-items' && (
                    <OpenItemsScreen dealId={deal.id} onNavigate={handleNavigate} />
                )}

            </div>
        </div>
    )
}
