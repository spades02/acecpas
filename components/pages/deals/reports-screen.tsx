'use client'

import ReportsScreenDetail from "@/components/pages/reports/ReportsScreen"
import { MOCK_REPORT_DATA } from "@/data/reports-data"

interface ReportsScreenProps {
    dealId: string;
    onNavigate: (page: string) => void;
}

export function ReportsScreen({ dealId, onNavigate }: ReportsScreenProps) {
    // In a real app, we would fetch the specific report for this dealId
    // For now, we mock it by using our standard mock data but overriding the deal name/ID context
    const dealReportData = {
        ...MOCK_REPORT_DATA,
        metadata: {
            ...MOCK_REPORT_DATA.metadata,
            dealName: "Deal Report Analysis", // Or fetch the actual name if available
            // We can add dealId to metadata if the interface supported it, but it doesn't currently.
        }
    };

    return (
        <ReportsScreenDetail
            onNavigate={onNavigate}
            data={dealReportData}
        />
    )
}
