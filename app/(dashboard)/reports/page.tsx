"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ReportsLibrary } from "@/components/pages/reports/reportsLibrary";
import ReportsScreen from "@/components/pages/reports/ReportsScreen";

export default function ReportsPage() {
  // 'null' means showing the grid. String means showing that specific report ID.
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {selectedReportId ? (
        // --- DETAIL VIEW ---
        <div className="flex flex-col h-full">
           {/* Back Button Bar */}
           <div className="border-b bg-white p-4">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedReportId(null)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Reports
              </Button>
           </div>
           
           {/* The Detail Component we built previously */}
           {/* You could fetch specific data here based on selectedReportId */}
           <ReportsScreen onNavigate={() => {}} /> 
        </div>
      ) : (
        // --- GRID VIEW ---
        <ReportsLibrary onSelectReport={(id) => setSelectedReportId(id)} />
      )}
    </div>
  );
}