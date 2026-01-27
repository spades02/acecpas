// reports-list-data.ts

export type ReportStatus = "Ready for Export" | "Draft" | "Archived" | "Processing";

export interface ReportSummary {
  id: string;
  dealId: string; // Added for navigation
  dealName: string;
  clientName: string;
  type: string; // e.g., "QoE Analysis", "Tax Compliance"
  generatedDate: string;
  author: string;
  status: ReportStatus;
  fileCount: number; // e.g., 8 worksheets
  totalSize: string; // e.g., "2.4 MB"
  thumbnailColor: "blue" | "green" | "purple" | "amber"; // For visual variety
}

export const MOCK_REPORTS_LIST: ReportSummary[] = [
  {
    id: "rep-001",
    dealId: "c26201a7-a85e-49a0-8da2-432fde8f141c",
    dealName: "Acme Corp Acquisition",
    clientName: "Acme Industries Inc.",
    type: "QoE Analysis",
    generatedDate: "Jan 6, 2026",
    author: "Sarah Chen",
    status: "Ready for Export",
    fileCount: 8,
    totalSize: "2.4 MB",
    thumbnailColor: "green"
  },
  {
    id: "rep-002",
    dealId: "deal-002",
    dealName: "TechFlow Merger",
    clientName: "Global Systems Ltd",
    type: "Financial Due Diligence",
    generatedDate: "Jan 5, 2026",
    author: "Mike Ross",
    status: "Archived",
    fileCount: 5,
    totalSize: "1.8 MB",
    thumbnailColor: "blue"
  },
  {
    id: "rep-003",
    dealId: "deal-003",
    dealName: "Apex Logistics Audit",
    clientName: "Apex Logistics",
    type: "Annual Audit",
    generatedDate: "Dec 28, 2025",
    author: "Jessica Pearson",
    status: "Archived",
    fileCount: 12,
    totalSize: "5.1 MB",
    thumbnailColor: "purple"
  },
  {
    id: "rep-004",
    dealId: "deal-004",
    dealName: "Sunrise Energy Series B",
    clientName: "Sunrise Capital",
    type: "Valuation Report",
    generatedDate: "Jan 7, 2026",
    author: "Sarah Chen",
    status: "Processing",
    fileCount: 0,
    totalSize: "--",
    thumbnailColor: "amber"
  },
  {
    id: "rep-005",
    dealId: "deal-005",
    dealName: "NorthEnd Retail Expansion",
    clientName: "NorthEnd Group",
    type: "Feasibility Study",
    generatedDate: "Nov 15, 2025",
    author: "Louis Litt",
    status: "Ready for Export",
    fileCount: 4,
    totalSize: "1.2 MB",
    thumbnailColor: "blue"
  },
  {
    id: "rep-006",
    dealId: "deal-006",
    dealName: "Quantum Soft IP Valuation",
    clientName: "Quantum Soft",
    type: "IP Valuation",
    generatedDate: "Oct 30, 2025",
    author: "Harvey Specter",
    status: "Archived",
    fileCount: 6,
    totalSize: "3.5 MB",
    thumbnailColor: "purple"
  }
];