"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, User, Calendar, DollarSign, Building } from "lucide-react";
import { Deal } from "@/data/deals-data"; // Import your Deal type

interface DealDetailSheetProps {
  deal: Deal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DealDetailSheet({ deal, open, onOpenChange }: DealDetailSheetProps) {
  if (!deal) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            Deal Details
            <Badge variant="outline" className="ml-2">
              {deal.status}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Section 1: Primary Deal Info */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase">Deal Information</div>
            <Card className="p-4 bg-muted/50">
              <div className="text-xl font-bold text-foreground">{deal.name}</div>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <Building className="w-4 h-4" />
                <span className="font-medium">{deal.client}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/50">
                <div>
                   <div className="text-xs text-muted-foreground">Value</div>
                   <div className="text-lg font-bold flex items-center">
                     <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                     {deal.amount?.toLocaleString() || "0"}
                   </div>
                </div>
                <div>
                   <div className="text-xs text-muted-foreground">Target Close</div>
                   <div className="text-lg font-medium flex items-center">
                     <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                     {deal.targetClose ? new Date(deal.targetClose).toLocaleDateString() : "TBD"}
                   </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Section 2: Progress / Probability (The "AI Insight" style card) */}
          <Card className="p-5 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-lg shadow-sm">
                📈
              </div>
              <div className="flex-1">
                <div className="font-semibold text-blue-900">Deal Probability</div>
                <div className="text-sm text-blue-700 mt-1">
                  This deal is trending positively based on recent activity.
                </div>
              </div>
              <div className="w-14 h-14 rounded-full bg-white border-4 border-blue-100 flex items-center justify-center shadow-sm">
                <div className="text-lg font-bold text-blue-700">{deal.progress}%</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-blue-800 uppercase">Next Best Action</div>
              <div className="bg-white p-3 rounded-lg text-sm text-slate-700 leading-relaxed shadow-sm border border-blue-100">
                Schedule a follow-up call regarding the "Enterprise License" terms. Last contact was 3 days ago.
              </div>
            </div>
          </Card>

          {/* Section 3: Recent Activity (Mimicking Sample Transactions) */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground uppercase">Recent Activity</div>
            <Card className="divide-y">
               {/* Mock Data for Activity */}
               {[
                 { action: "Contract Sent", user: "Sarah Chen", date: "2 days ago" },
                 { action: "Meeting: Technical Review", user: "Mike Ross", date: "5 days ago" },
                 { action: "Stage Changed: Negotiation", user: "System", date: "1 week ago" }
               ].map((log, i) => (
                <div key={i} className="p-3 bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{log.action}</div>
                    <div className="text-xs text-muted-foreground">{log.date}</div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> {log.user}
                  </div>
                </div>
               ))}
            </Card>
          </div>

          {/* Actions Footer */}
          <div className="sticky bottom-0 pt-4 pb-2 bg-background mt-auto border-t">
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                Open Full Deal Workspace
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" size="sm">Edit Details</Button>
                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  Mark as Lost
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}