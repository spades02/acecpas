import { FileText, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

// --- Types ---

export interface ReportMetadata {
  dealName: string;
  clientName: string;
  dateRange: string;
  generatedDate: string;
  author: string;
  version: string;
  status: "Ready for Export" | "Draft" | "Final";
}

export interface ProcessingStats {
  duration: string;
  accountsMapped: number;
  openItemsCount: number;
  hoursSaved: number;
}

export interface ExcelTableRow {
  accountNum: string;
  name: string;
  category: string;
  debit: number | null;
  credit: number | null;
  balance: number;
}

export interface ExcelTableSection {
  title: string;
  rows: ExcelTableRow[];
  totalLabel: string;
  totalValue: number;
  isRevenue?: boolean; // To handle the specific styling for Revenue
}

export interface ExcelData {
  summary: {
    totalAccounts: number;
    worksheets: number;
    transactions: number;
    durationLabel: string;
  };
  trialBalance: {
    sections: ExcelTableSection[];
    grandTotal: number;
  }
}

export interface FinancialHighlight {
  label: string;
  value: string;
  subtext: string;
  colorTheme: "green" | "blue" | "purple" | "amber";
  icon?: any;
}

export interface KeyFinding {
  type: "success" | "warning";
  title: string;
  description: string;
}

export interface PdfData {
  dealOverview: {
    target: string;
    industry: string;
    type: string;
    size: string;
    period: string;
  };
  highlights: FinancialHighlight[];
  findings: KeyFinding[];
  conclusion: {
    text: string;
    boldText: string;
  };
}

export interface OpenItem {
  id: number;
  priority: "High" | "Medium" | "Low";
  category: string;
  amount: number;
  quarter: string;
  description: string;
  subtext: string;
}

export interface ReportData {
  metadata: ReportMetadata;
  processing: ProcessingStats;
  excel: ExcelData;
  pdf: PdfData;
  openItems: OpenItem[];
}

// --- Mock Data ---

export const MOCK_REPORT_DATA: ReportData = {
  metadata: {
    dealName: "Acme Corp Acquisition",
    clientName: "Acme Industries Inc.",
    dateRange: "January 2023 - September 2024 (TTM)",
    generatedDate: "Jan 6, 2026",
    author: "Sarah Chen",
    version: "1.0",
    status: "Ready for Export"
  },
  processing: {
    duration: "14 minutes",
    accountsMapped: 1047,
    openItemsCount: 6,
    hoursSaved: 47
  },
  excel: {
    summary: {
      totalAccounts: 1047,
      worksheets: 8,
      transactions: 14100,
      durationLabel: "21 months"
    },
    trialBalance: {
      grandTotal: 0, // Debits usually equal credits in TB, or net income
      sections: [
        {
          title: "ASSETS",
          totalLabel: "Total Current Assets",
          totalValue: 1446820.00,
          rows: [
            { accountNum: "1000", name: "Cash - Operating Account", category: "Current Assets", debit: 125450.00, credit: null, balance: 125450.00 },
            { accountNum: "1010", name: "Cash - Payroll Account", category: "Current Assets", debit: 45230.00, credit: null, balance: 45230.00 },
            { accountNum: "1100", name: "Accounts Receivable", category: "Current Assets", debit: 850340.00, credit: null, balance: 850340.00 },
            { accountNum: "1200", name: "Inventory", category: "Current Assets", debit: 425800.00, credit: null, balance: 425800.00 },
          ]
        },
        {
          title: "LIABILITIES",
          totalLabel: "Total Current Liabilities",
          totalValue: -245600.00,
          rows: [
            { accountNum: "2000", name: "Accounts Payable", category: "Current Liabilities", debit: null, credit: 245600.00, balance: -245600.00 },
          ]
        },
        {
          title: "REVENUE",
          totalLabel: "Total Revenue",
          totalValue: -5000000.00,
          isRevenue: true,
          rows: [
            { accountNum: "4000", name: "Product Revenue", category: "Operating Revenue", debit: null, credit: 5000000.00, balance: -5000000.00 },
          ]
        }
      ]
    }
  },
  pdf: {
    dealOverview: {
      target: "Acme Corp",
      industry: "Technology / SaaS",
      type: "M&A Acquisition",
      size: "$25M - $50M",
      period: "January 2023 - September 2024 (21 months TTM)"
    },
    highlights: [
      {
        label: "Total Revenue (TTM)",
        value: "$5,000,000",
        subtext: "+23% YoY Growth",
        colorTheme: "green",
        icon: TrendingUp
      },
      {
        label: "Adjusted EBITDA",
        value: "$1,500,000",
        subtext: "30% Margin",
        colorTheme: "blue"
      },
      {
        label: "Total Assets",
        value: "$2,450,890",
        subtext: "",
        colorTheme: "purple"
      },
      {
        label: "Working Capital",
        value: "$1,201,220",
        subtext: "",
        colorTheme: "amber"
      }
    ],
    findings: [
      {
        type: "success",
        title: "Revenue Quality",
        description: "Recurring revenue represents 87% of total revenue, indicating strong business model sustainability"
      },
      {
        type: "warning",
        title: "EBITDA Adjustments",
        description: "6 non-recurring expenses identified totaling $142,500 (one-time legal fees, restructuring costs)"
      },
      {
        type: "success",
        title: "Accounts Receivable",
        description: "DSO of 42 days is within industry norms; no material aging concerns"
      },
      {
        type: "warning",
        title: "Open Items",
        description: "6 items requiring client clarification (personal expenses, unusual transactions) - See Appendix A"
      }
    ],
    conclusion: {
      text: "Based on our analysis of Acme Corp's financial statements for the period January 2023 through September 2024, the company demonstrates strong financial performance with sustainable revenue growth and healthy margins.",
      boldText: "Adjusted EBITDA of $1,642,500 (excluding non-recurring items) represents a 33% margin, above industry average for SaaS companies at this scale."
    }
  },
  openItems: [
    { id: 1, priority: 'High', category: 'Personal Use', amount: 1415.00, quarter: 'Q1 2024', description: 'Spa/wellness expenses requiring business justification', subtext: 'Requires client response and supporting documentation' },
    { id: 2, priority: 'Medium', category: 'Outlier', amount: 25000.00, quarter: 'Q1 2024', description: 'Large wire transfer to offshore account', subtext: 'Requires client response and supporting documentation' },
    { id: 3, priority: 'High', category: 'Revenue Rec', amount: 45000.00, quarter: 'Q2 2024', description: 'Advance payment with unclear delivery terms', subtext: 'Requires client response and supporting documentation' },
    { id: 4, priority: 'Medium', category: 'Informal', amount: 3200.00, quarter: 'Q2 2024', description: 'Cash payments without proper documentation', subtext: 'Requires client response and supporting documentation' },
    { id: 5, priority: 'Low', category: 'Classification', amount: 8500.00, quarter: 'Q3 2024', description: 'Equipment purchase vs lease classification', subtext: 'Requires client response and supporting documentation' },
    { id: 6, priority: 'Medium', category: 'Accrual', amount: 12400.00, quarter: 'Q4 2023', description: 'Year-end accrual requiring verification', subtext: 'Requires client response and supporting documentation' },
  ]
};