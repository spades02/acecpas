"use client"

import { useRouter } from "next/navigation";
import { ReportsLibrary } from "@/components/pages/reports/reportsLibrary";
import { MOCK_REPORTS_LIST } from "@/data/reports-list-data";
import { toast } from "sonner";

export default function ReportsPage() {
  const router = useRouter();

  const handleSelectReport = (reportId: string) => {
    const report = MOCK_REPORTS_LIST.find((r) => r.id === reportId);
    if (report && report.dealId) {
      router.push(`/deals/${report.dealId}/reports`);
    } else {
      console.warn("Report or Deal ID not found");
      toast("Report not found", {
        description: "Please try again"
      })
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ReportsLibrary onSelectReport={handleSelectReport} />
    </div>
  );
}