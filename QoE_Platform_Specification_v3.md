**QUALITY OF EARNINGS (QoE)**

**AUTOMATION PLATFORM**

Technical Design & Build Specification

**Version 3.0 — Complete Developer Reference**

February 2026

**INTERNAL USE ONLY**

[1\. EXECUTIVE SUMMARY 1](#_Toc221008826)

[1.1 Purpose 1](#_Toc221008827)

[1.2 What is a Quality of Earnings (QoE) Analysis? 1](#_Toc221008828)

[1.3 Key Accounting Concepts for Developers 1](#_Toc221008829)

[1.4 What This System Does 1](#_Toc221008830)

[1.5 Core Design Principles 1](#_Toc221008831)

[1.6 Primary Data Sources (Priority Order) 1](#_Toc221008832)

[2\. SYSTEM ARCHITECTURE 1](#_Toc221008833)

[2.1 High-Level Architecture 1](#_Toc221008834)

[2.2 Technology Stack 1](#_Toc221008835)

[2.3 Core Processing Engines 1](#_Toc221008836)

[3\. USER INTERFACE STRUCTURE 1](#_Toc221008837)

[3.1 Tab/Section Overview 1](#_Toc221008838)

[3.2 Income Statement Tab (Primary Workspace) 1](#_Toc221008839)

[3.2.1 Layout Mockup 1](#_Toc221008840)

[3.2.2 Click-to-Drill Behavior 1](#_Toc221008841)

[3.2.3 Drill-Down Panel Mockup 1](#_Toc221008842)

[3.2.4 Anomaly Detection & Color Coding 1](#_Toc221008843)

[3.3 Balance Sheet Tab (Primary Workspace) 1](#_Toc221008844)

[3.4 Global View Controls 1](#_Toc221008845)

[3.5 One-Click Addback Creation 1](#_Toc221008846)

[4\. DYNAMIC VIEW SYSTEM 1](#_Toc221008847)

[4.1 View Dimensions 1](#_Toc221008848)

[4.1.1 Accounting Basis Toggle 1](#_Toc221008849)

[4.1.2 Data Source Selection 1](#_Toc221008850)

[4.1.3 Entity Configuration 1](#_Toc221008851)

[4.2 View State Data Model 1](#_Toc221008852)

[4.3 View Caching Strategy 1](#_Toc221008853)

[5\. DRILL-DOWN & ANOMALY SYSTEM 1](#_Toc221008854)

[5.1 P&L to GL Linkage 1](#_Toc221008855)

[5.2 Linkage Data Model 1](#_Toc221008856)

[5.3 Anomaly Detection Logic 1](#_Toc221008857)

[6\. USER ADJUSTMENT SYSTEM 1](#_Toc221008858)

[6.1 Adjustment Sources 1](#_Toc221008859)

[6.2 Excel Import Template 1](#_Toc221008860)

[6.2.1 Template Structure 1](#_Toc221008861)

[6.2.2 Import Validation Rules 1](#_Toc221008862)

[6.3 EBITDA Bridge Generation 1](#_Toc221008863)

[6.4 Approval Workflow 1](#_Toc221008864)

[7\. DATA MODELS 1](#_Toc221008865)

[7.1 Core Engagement 1](#_Toc221008866)

[7.2 Uploaded Files 1](#_Toc221008867)

[7.3 Monthly P&L 1](#_Toc221008868)

[7.4 Monthly Balance Sheet 1](#_Toc221008869)

[7.5 General Ledger 1](#_Toc221008870)

[7.6 Bank Statement 1](#_Toc221008871)

[7.7 Account Mapping 1](#_Toc221008872)

[7.8 Adjustments 1](#_Toc221008873)

[7.9 Normalized Financials 1](#_Toc221008874)

[7.10 EBITDA Bridge 1](#_Toc221008875)

[7.11 Phase 2 & 3 Data Models 1](#_Toc221008876)

[8\. AI AGENT SPECIFICATIONS 1](#_Toc221008877)

[8.1 Agent 1: Validation Agent 1](#_Toc221008878)

[8.1.1 Input 1](#_Toc221008879)

[8.1.2 Validation Checks 1](#_Toc221008880)

[8.1.3 Output 1](#_Toc221008881)

[8.2 Agent 2: Account Mapping Agent 1](#_Toc221008882)

[8.2.1 System Prompt 1](#_Toc221008883)

[8.2.2 Input/Output Format 1](#_Toc221008884)

[8.3 Agent 3: Anomaly Analysis Agent 1](#_Toc221008885)

[8.3.1 System Prompt 1](#_Toc221008886)

[8.3.2 Input/Output Format 1](#_Toc221008887)

[8.4 Agent 4: Addback Detection Agent 1](#_Toc221008888)

[8.4.1 Detection Categories 1](#_Toc221008889)

[8.4.2 Confidence Calibration 1](#_Toc221008890)

[8.4.3 Critical Rules for Addback Detection 1](#_Toc221008891)

[8.5 Agent 5: Normalization Agent 1](#_Toc221008892)

[8.6 Agent 6: Revenue Analysis Agent 1](#_Toc221008893)

[8.6.1 Analysis Performed 1](#_Toc221008894)

[8.7 Agent 7: Working Capital Agent 1](#_Toc221008895)

[8.7.1 Analysis Performed 1](#_Toc221008896)

[8.8 Agent 8: Report Generation Agent 1](#_Toc221008897)

[8.8.1 Report Sections Generated 1](#_Toc221008898)

[8.8.2 Traceability Requirements 1](#_Toc221008899)

[9\. GOVERNANCE & CONTROLS 1](#_Toc221008900)

[9.1 Role-Based Access Control (RBAC) 1](#_Toc221008901)

[9.2 Audit Trail Requirements 1](#_Toc221008902)

[9.3 Escalation Rules 1](#_Toc221008903)

[10\. API SPECIFICATIONS 1](#_Toc221008904)

[10.1 Engagement Endpoints 1](#_Toc221008905)

[10.2 File Upload Endpoints 1](#_Toc221008906)

[10.3 Validation Endpoints 1](#_Toc221008907)

[10.4 Account Mapping Endpoints 1](#_Toc221008908)

[10.5 Income Statement Endpoint 1](#_Toc221008909)

[10.6 Drill-Down Endpoint 1](#_Toc221008910)

[10.7 Adjustment Endpoints 1](#_Toc221008911)

[10.8 Import/Export Endpoints 1](#_Toc221008912)

[10.9 EBITDA Bridge Endpoint 1](#_Toc221008913)

[10.10 Report & Audit Endpoints 1](#_Toc221008914)

[11\. BUILD PHASES 1](#_Toc221008915)

[11.1 PHASE 1: Core Foundation 1](#_Toc221008916)

[11.1.1 Phase 1 Scope — What to Build 1](#_Toc221008917)

[11.1.2 Phase 1 Scope — What NOT to Build Yet 1](#_Toc221008918)

[11.1.3 Phase 1 Build Sequence 1](#_Toc221008919)

[11.1.4 Phase 1 Testing Checklist 1](#_Toc221008920)

[11.1.5 Phase 1 User Flows 1](#_Toc221008921)

[11.2 PHASE 2: Balance Sheet & Dynamic Views 1](#_Toc221008922)

[11.2.1 Phase 2 Scope 1](#_Toc221008923)

[11.2.2 Phase 2 New Data Models 1](#_Toc221008924)

[11.3 PHASE 3: Multi-Entity & Advanced Analysis 1](#_Toc221008925)

[11.3.1 Phase 3 Scope 1](#_Toc221008926)

[11.3.2 Phase 3 New Data Models 1](#_Toc221008927)

[11.4 PHASE 4: Reporting & Polish 1](#_Toc221008928)

[11.4.1 Phase 4 Scope 1](#_Toc221008929)

[APPENDIX A: Standard Adjustment Categories 1](#_Toc221008930)

[APPENDIX B: Standard P&L and BS Categories 1](#_Toc221008931)

[B.1 Standard P&L Categories 1](#_Toc221008932)

[B.2 Standard BS Categories 1](#_Toc221008933)

[APPENDIX C: File Format Specifications 1](#_Toc221008934)

[C.1 Monthly P&L Expected Format 1](#_Toc221008935)

[C.2 GL Detail Expected Format 1](#_Toc221008936)

[APPENDIX D: Glossary 1](#_Toc221008937)

# 1\. EXECUTIVE SUMMARY

## 1.1 Purpose

This document is the complete, authoritative specification for building the QoE Automation Platform.

This document serves as your single source of truth. If something is described here, build it. If something is not described here, ask before building it.

## 1.2 What is a Quality of Earnings (QoE) Analysis?

**Developer Context:** This section explains the business domain. Understanding this is critical to building the product correctly.

When a company is being bought or sold (an M&A transaction), the buyer needs to know how much money the company actually makes. The seller says their company earns a certain profit, but the buyer wants to verify that number and adjust it for items that are misleading, one-time, or not part of normal business operations.

A Quality of Earnings (QoE) analysis is the process of taking the reported financial statements and adjusting them to reveal the true, sustainable earnings of a business. The end result is a number called Adjusted EBITDA, which represents what the company reliably earns from its normal operations, stripped of noise.

Think of it this way: **Reported financials** are the raw story the books tell. **Adjusted financials** are the cleaned-up story that a buyer can trust. Our platform automates the process of going from one to the other.

## 1.3 Key Accounting Concepts for Developers

You will encounter these terms throughout this document and the codebase. Here is what each one means in plain language:

| **Term** | **What It Is (Plain Language)** | **Why It Matters to Us** |
| --- | --- | --- |
| P&L (Profit & Loss) / Income Statement | A report showing Revenue minus Expenses = Profit for a period (month, quarter, year). Like a movie of financial performance. | This is the PRIMARY view in our app. Users live on this tab. Every line item is clickable. |
| Balance Sheet (BS) | A snapshot of what the company Owns (Assets), Owes (Liabilities), and the leftover (Equity) at a specific date. Like a photograph of financial position. | The SECOND primary view. Users drill into BS items for working capital analysis. |
| General Ledger (GL) | The full transaction log. Every single financial event (invoice, payment, journal entry) is a row in the GL. It is the most granular data. | This is our drill-down data. When a user clicks a P&L number, we show the GL transactions that make up that number. |
| Trial Balance (TB) | A summary of all GL accounts with their total Debit and Credit balances. Used to verify the books balance (Debits = Credits). | We use this for validation/reconciliation. If TB totals do not balance, something is wrong with the data. |
| EBITDA | Earnings Before Interest, Taxes, Depreciation, and Amortization. A proxy for cash earnings from operations. Start with Net Income, add back Interest, Taxes, Depreciation, Amortization. | This is the starting point for the QoE analysis. We calculate Reported EBITDA, then apply adjustments to get Adjusted EBITDA. |
| Addback / Adjustment | An item added to (or subtracted from) Reported EBITDA to normalize it. Examples: owner overpaying themselves, one-time lawsuits, personal expenses run through the business. | This is the core output of our analysis. The AI detects potential addbacks, the user approves them, and they flow into the EBITDA Bridge. |
| EBITDA Bridge | A walkthrough showing: Reported EBITDA + Adjustment 1 + Adjustment 2 - Adjustment 3 = Adjusted EBITDA. It is literally a bridge from reported to adjusted. | This is the key deliverable. Buyers use this to understand and trust the adjusted number. |
| Accrual vs Cash Basis | Accrual = record revenue when earned, expense when incurred (even if cash has not moved). Cash = record only when cash actually comes in or goes out. | Our system supports toggling between these views. Same underlying data, different timing of recognition. |
| Working Capital (NWC) | Current Assets minus Current Liabilities. Represents the cash tied up in running the business day-to-day (inventory on shelves, unpaid invoices, etc.). | Buyers negotiate a working capital peg (target). We analyze NWC trends to help set this. |
| AR/AP Aging | Accounts Receivable Aging = how old are the invoices customers owe you. Accounts Payable Aging = how old are the bills you owe suppliers. | Used for working capital analysis and cash conversion assessment. |
| Intercompany (IC) | Transactions between related entities (e.g., Parent Co pays a subsidiary). These must be eliminated in consolidated view to avoid double-counting. | Multi-entity engagements need IC elimination. We flag and remove these on toggle. |

## 1.4 What This System Does

The QoE Platform is a web application that automates the most time-consuming parts of a QoE analysis. Here is the end-to-end workflow:

| **Step** | **What Happens** | **Who Does It** |
| --- | --- | --- |
| 1\. Create Engagement | User creates a new QoE project: names the deal, sets periods, selects industry. | User (Analyst) |
| 2\. Upload Financial Data | User uploads files: Monthly P&L, Monthly Balance Sheet, General Ledger, Trial Balance, Bank Statements, AR/AP Aging. | User (Analyst) |
| 3\. System Validates | System checks: are files complete? Do periods match? Does the GL balance? Does the TB tie to the GL? | System (Automatic) |
| 4\. Account Mapping | System maps each GL account to a standard P&L or BS line item (AI suggests, user confirms). | AI + User |
| 5\. Data Linkage | System links GL transactions to P&L/BS line items so every number is drillable. | System (Automatic) |
| 6\. Anomaly Detection | AI scans every P&L line item for unusual variances (e.g., an expense that is 3x higher than usual). | AI (Automatic) |
| 7\. User Reviews | User clicks on flagged items, sees GL transactions and AI analysis, decides if addback is warranted. | User (Analyst) |
| 8\. Create Adjustments | User selects transactions and creates adjustments (one-click from drill-down, or import from Excel). | User (Analyst) |
| 9\. Approval Workflow | Adjustments go through Draft → Pending → Approved/Rejected workflow. | User (Reviewer) |
| 10\. Generate Reports | System computes EBITDA Bridge, generates QoE report with all supporting schedules. | System (Automatic) |

## 1.5 Core Design Principles

| **Principle** | **What It Means in Practice** |
| --- | --- |
| Click-to-Drill Everywhere | Every number in the Income Statement and Balance Sheet is a clickable link. Clicking opens a panel showing the actual GL transactions that make up that number. No number exists in isolation. |
| AI Anomaly Detection | The system automatically highlights unusual variances (color-coded by severity). AI provides analysis of what is causing the anomaly and whether it might be an addback candidate. |
| One-Click Addbacks | From any drill-down, the user can check transactions and create an adjustment with one click. The form is pre-populated with AI suggestions. |
| Human-in-the-Loop | AI suggests, humans decide. No adjustment is final without explicit user approval. The system never makes autonomous decisions about what to adjust. |
| Dynamic Views | Users can toggle between Accrual/Cash basis, switch entities, consolidate or separate, and change period ranges. View switches should feel instant (under 500ms). |
| Full Traceability | Every number traces to its source document. Every adjustment links to the GL entries that prompted it. Every approval is logged with who, when, and why. |
| Multi-Source Reconciliation | The system can compare financials built from different sources (GL-derived vs uploaded P&L vs bank statements) and flag material variances. |

## 1.6 Primary Data Sources (Priority Order)

These are the files users upload. They are listed in order of importance to the core workflow:

| **Priority** | **Data Source** | **Format** | **Criticality** | **What It Provides** |
| --- | --- | --- | --- | --- |
| **1** | **Monthly P&L** | XLSX/CSV | **CRITICAL** | The primary Income Statement view. This is the P&L as the company reports it. Each row becomes a clickable line item in our Income Statement tab. |
| **2** | **Monthly Balance Sheet** | XLSX/CSV | **CRITICAL** | The primary Balance Sheet view. Shows Assets, Liabilities, Equity at each month-end. Each row becomes a clickable line item in our Balance Sheet tab. |
| **3** | **General Ledger Detail** | XLSX/CSV | **CRITICAL** | The transaction-level detail. When a user clicks any P&L or BS number, we query the GL to show the individual transactions. This is also where AI anomaly analysis happens. |
| 4   | Trial Balance | XLSX/CSV | Important | Summary of all GL accounts with Debit/Credit totals. Used to validate that the GL is balanced and ties to the P&L/BS. |
| 5   | Bank Statements | CSV/PDF | Important | Actual bank records. Used for cash-basis view and reconciliation against GL. PDF statements require OCR parsing. |
| 6   | AR/AP Aging | XLSX/CSV | Supporting | Age breakdown of Accounts Receivable and Accounts Payable. Used for working capital analysis. |

**Key Insight:** Items 1-3 are the core of Phase 1. The P&L and BS provide the summary view the user sees; the GL provides the transaction detail for drill-down. Everything else enhances the analysis but is not required for a functional product.

# 2\. SYSTEM ARCHITECTURE

## 2.1 High-Level Architecture

The platform follows a layered architecture with clear separation of concerns. Each layer is independently testable. When you are working on one layer, you should not need to understand the internals of other layers.

┌────────────────────────────────────────────────────────────────────┐

│ PRESENTATION LAYER │

│ React Frontend | Tab Views | Drill-Down Panels | Reports │

└────────────────────────────────────────────────────────────────────┘

|

┌────────────────────────────────────────────────────────────────────┐

│ API LAYER (FastAPI) │

│ REST Endpoints | WebSocket | File Upload | Export │

└────────────────────────────────────────────────────────────────────┘

|

┌────────────────────────────────────────────────────────────────────┐

│ ORCHESTRATION LAYER │

│ Workflow Engine | Agent Coordinator | View Generator | Cache│

└────────────────────────────────────────────────────────────────────┘

|

┌────────────────────────────────────────────────────────────────────┐

│ AI AGENT LAYER │

│ Validation | Mapping | Anomaly | Addback | Revenue | WC | Report │

└────────────────────────────────────────────────────────────────────┘

|

┌────────────────────────────────────────────────────────────────────┐

│ PROCESSING LAYER │

│ Parsers | Calculators | Reconcilers | Transformers │

└────────────────────────────────────────────────────────────────────┘

|

┌────────────────────────────────────────────────────────────────────┐

│ STORAGE LAYER │

│ PostgreSQL | Blob Storage (S3) | Redis Cache | Audit Log │

└────────────────────────────────────────────────────────────────────┘

## 2.2 Technology Stack

| **Layer** | **Technology** | **Why This Choice** |
| --- | --- | --- |
| Frontend | React + TypeScript | Component-based UI ideal for tabbed views, drill-down panels, and interactive tables. |
| API | FastAPI (Python) | Async support, auto-generated docs, type validation. Python pairs well with data processing. |
| Database | PostgreSQL | Strong JSON support (JSONB), good for financial data precision (NUMERIC type), mature. |
| Cache | Redis | Fast in-memory store for pre-computed views. View switches need to be under 500ms. |
| File Storage | S3 / Local Blob | Uploaded financial files stored as blobs. Checksums for integrity verification. |
| AI  | Claude API (Anthropic) | Used for anomaly analysis, account mapping suggestions, addback detection. Called via API. |
| Search | PostgreSQL Full Text | For searching GL transactions by description, vendor, etc. No need for Elasticsearch initially. |

## 2.3 Core Processing Engines

The Processing Layer contains specialized engines. Each engine has a clear input, transformation, and output:

| **Engine** | **Input** | **What It Does** | **Output** |
| --- | --- | --- | --- |
| File Parser | Uploaded XLSX/CSV/PDF | Detects columns, headers, data types. Extracts structured data from files. | Parsed records in database tables |
| Validation Engine | Parsed financial data | Checks completeness, balances (Debits=Credits), period coverage, cross-source consistency. | Validation report (pass/fail with details) |
| Normalization Engine | Validated GL + Mappings | Applies account mappings, aggregates GL to standard P&L/BS format, computes both accrual and cash views. | Normalized financial statements |
| Reconciliation Engine | GL, Bank Stmts, Client FS | Compares financial totals across sources. Flags material variances. | Reconciliation report with variance details |
| Calculation Engine | Normalized financials + Adjustments | Computes EBITDA, margins, ratios, bridges. Recomputes when adjustments change. | Computed metrics and bridges |
| View Generator | Any financial data + ViewState | Creates the specific view the user requested (period, basis, entity, rounding). | View-ready data for the frontend |

# 3\. USER INTERFACE STRUCTURE

## 3.1 Tab/Section Overview

The UI is organized into tabs. Two tabs are the primary workspaces where users spend 80%+ of their time. The other tabs support specific analysis workflows.

| **Tab Name** | **Priority** | **Purpose** | **Phase** |
| --- | --- | --- | --- |
| **Income Statement** | **★★★ PRIMARY** | Monthly P&L view with drill-down to GL. This is where users live. | 1   |
| **Balance Sheet** | **★★★ PRIMARY** | Monthly BS view with drill-down to GL. Second most-used view. | 2   |
| Revenue Analysis | ★★  | Revenue breakdown by customer, product, channel. Concentration analysis. | 3   |
| COGS Analysis | ★★  | Cost of goods breakdown. Margin analysis by category. | 3   |
| Expense Analysis | ★★  | Operating expense trends, run-rate analysis, unusual items. | 3   |
| EBITDA Bridge | ★★★ | Reported to Adjusted EBITDA walkthrough. Auto-computed from adjustments. | 1   |
| Trend Analysis | ★   | Month-over-month, year-over-year bridges. Seasonality patterns. | 3   |
| Working Capital | ★★  | NWC schedule, AR/AP days, inventory turns, peg recommendation. | 4   |
| Adjustments | ★★★ | All adjustments in one place. Approval workflow. Import from Excel. | 1   |
| Data Sources | ★   | View uploaded files, parsing status, validation results. | 1   |
| Report | ★★  | Generate and download QoE report (PDF/Word). | 4   |

## 3.2 Income Statement Tab (Primary Workspace)

This is the most important view in the application. It displays the monthly Profit & Loss statement directly from the uploaded financial data. Every single number is clickable. When clicked, a drill-down panel slides open showing the actual GL transactions that compose that number.

### 3.2.1 Layout Mockup

+-------------------------------------------------------------------------+

| INCOME STATEMENT \[View Controls\] |

| -----------------------------------------------------------------------+

| Toggle: \[Accrual v\] \[Cash\] Entity: \[All v\] Period: \[Jan-Dec 2023 v\]|

| Show: \[Reported\] \[Adjusted\] \[Both\] Highlight Anomalies: \[ON\] |

|-------------------------------------------------------------------------|

| Jan Feb Mar Apr ... YTD TTM |

| ======================================================================|

| REVENUE |

| Product Revenue 125,000 132,000 128,000 ... 1,540,000 |

| Service Revenue 45,000 48,000 52,000 ... 580,000 |

| Other Income 2,000 1,500 \[18,500\] ... 42,000 FLAG |

| ---------------------------------------------------|

| Total Revenue 172,000 181,500 198,500 ... 2,162,000 |

| |

| COST OF GOODS SOLD |

| Materials 52,000 54,000 53,000 ... 648,000 |

| Direct Labor 28,000 29,500 30,000 ... 352,000 |

| ---------------------------------------------------|

| Total COGS 80,000 83,500 83,000 ... 1,000,000 |

| |

| GROSS PROFIT 92,000 98,000 115,500 ... 1,162,000 |

| Gross Margin % 53.5% 54.0% 58.2% ... 53.7% |

| |

| OPERATING EXPENSES |

| Payroll 35,000 36,000 35,500 ... 425,000 |

| Rent 8,000 8,000 8,000 ... 96,000 |

| Prof. Fees 3,500 4,200 \[45,000\] ... 85,000 FLAG |

| ... |

| |

| \[Flagged items shown in RED/YELLOW with anomaly indicator\] |

+-------------------------------------------------------------------------+

### 3.2.2 Click-to-Drill Behavior

This is the feature that makes this tool powerful. Implementation details:

| **Behavior** | **Implementation Detail** |
| --- | --- |
| Clickable cells | Every numeric cell in the P&L grid has an onClick handler. Cursor changes to pointer on hover. Cells with anomalies get a colored background. |
| Drill-down panel | A slide-out panel (right side, ~50% width) that shows GL transactions. Panel includes AI analysis section at top if anomaly detected. |
| Transaction sorting | Default sort: by absolute amount, descending (largest transactions first). User can re-sort by date, description, or vendor. |
| Anomaly indicator | If the line item has an anomaly, the panel shows a banner at the top: anomaly type, severity, trailing average, variance multiple, and AI analysis text. |
| Addback checkboxes | Each transaction row has a checkbox. User can select one or more, then click the Add as Adjustment button at the bottom of the panel. |
| Bulk selection | A Select All checkbox at the header, plus shift-click for range selection. |
| Running total | As user checks/unchecks transactions, a running total of selected amount updates in real-time. |
| Export | An Export to Excel button exports the drill-down data (all transactions for that line/period). |

### 3.2.3 Drill-Down Panel Mockup

+----------------------------------------------------------------------+

| DRILL-DOWN: Professional Fees - March 2023 \[X Close\]|

|----------------------------------------------------------------------|

| !! ANOMALY: This amount is 3.2x higher than trailing 3-month avg |

| |

| AI ANALYSIS: |

| "March Prof. Fees of $45,000 is significantly higher than the |

| typical $14,000 range. This is driven primarily by a single |

| transaction: 'Legal - Smith & Associates' for $35,000 (78% of |

| total). This appears to be a one-time legal matter and is a |

| strong addback candidate." |

| |

| TRANSACTIONS: |

| +--------+-------------------------------+----------+--------------+|

| | Date | Description | Amount | Action ||

| +--------+-------------------------------+----------+--------------+|

| | 03/10 | Legal - Smith & Associates | $35,000 | \[x\] Addback ||

| | 03/02 | Annual Audit Fee | $5,000 | \[ \] Addback ||

| | 03/15 | Tax Preparation | $3,000 | \[ \] Addback ||

| | 03/28 | Monthly Consulting | $2,000 | \[ \] Addback ||

| +--------+-------------------------------+----------+--------------+|

| Selected: $35,000 |

| |

| \[Add Selected as Adjustment\] \[Export to Excel\] \[Close\] |

+----------------------------------------------------------------------+

### 3.2.4 Anomaly Detection & Color Coding

The system automatically analyzes each P&L line item for each period and flags unusual variances. Anomalies are detected by comparing the current period amount to the trailing 3-month average (excluding the current month).

| **Anomaly Type** | **Trigger Condition** | **Visual Treatment** | **What It Means** |
| --- | --- | --- | --- |
| Large Variance | Current amount is >3x the trailing 3-month average | RED background on cell | Something dramatically different happened this month. Very likely an addback candidate. |
| Moderate Variance | Current amount is >2x the trailing 3-month average | YELLOW background on cell | Noticeably elevated, worth investigating. May or may not be an addback. |
| New Account | Account appears for the first time (no trailing history) | BLUE dot indicator | A new expense category appeared. Could be reclassification or genuinely new. |
| Missing Period | Account had activity in prior months but is zero this month | GRAY italic text showing $0 | Something that usually has a balance is missing. Could be timing or error. |
| Rounding Issue | GL-derived amount differs from reported P&L amount by < $50 | ORANGE border on cell | Minor discrepancy between GL sum and reported amount. Usually harmless. |

## 3.3 Balance Sheet Tab (Primary Workspace)

Same drill-down functionality as the Income Statement but for balance sheet data. Shows monthly snapshots of the company’s financial position.

| **Feature** | **Details** |
| --- | --- |
| Layout | Identical to Income Statement tab but organized by: Assets (Current, Non-Current), Liabilities (Current, Non-Current), Equity. |
| Click-to-drill | Every balance is clickable. Shows GL transactions that affected that account during the period. |
| Anomaly detection | Flags unusual balance changes (e.g., AR doubled, new large liability appeared). |
| Working Capital highlights | Current Assets and Current Liabilities are visually grouped. Net Working Capital line auto-calculated. |
| Intercompany flags | If multi-entity, intercompany balances are highlighted for review/elimination. |
| Period comparison | Shows change vs prior period (both $ and %) for each line item. |

## 3.4 Global View Controls

These controls appear on every tab and affect the entire view. When a user changes any control, the view updates immediately (target: under 500ms via cached pre-computed views).

+----------------------------------------------------------------------+

| Accounting Basis: ( ) Accrual ( ) Cash ( ) Side-by-Side |

| |

| Data Source: ( ) P&L/BS Uploaded ( ) GL-Derived ( ) Compare |

| |

| Entity: \[All Entities v\] \[ \] Eliminate Intercompany |

| ( ) Consolidated ( ) Single Entity: \[Select...\] |

| |

| Period Range: From: \[Jan 2023 v\] To: \[Dec 2023 v\] |

| \[Monthly\] \[Quarterly\] \[Annual\] \[TTM\] \[LTM\] |

| |

| Display: ( ) Reported ( ) Adjusted ( ) Both |

| \[ \] Show Anomaly Highlights \[ \] Show Variance % |

| Rounding: \[Actual v\] \[Thousands\] \[Millions\] |

| |

| Compare To: \[ \] Prior Period \[ \] Prior Year \[ \] Budget |

+----------------------------------------------------------------------+

**Developer Note:** The Accrual/Cash toggle and GL-Derived/Uploaded source selection require pre-computed views. You cannot recalculate these on the fly. See Section 4 (Dynamic View System) for the caching strategy.

## 3.5 One-Click Addback Creation

When a user clicks the Add Selected as Adjustment button from the drill-down panel, a modal appears pre-populated with AI suggestions:

+--------------------------------------------------------------+

| CREATE ADJUSTMENT \[X\] |

|--------------------------------------------------------------|

| |

| Selected Transactions: |

| \* 03/10 Legal - Smith & Associates $35,000 |

| -------- |

| Total: $35,000 |

| |

| Category: \[One-Time - Legal v\] <- AI suggested |

| Description: \[Legal settlement - Smith matter \] |

| Amount: \[$35,000 \] |

| Period: \[March 2023 \] |

| |

| Rationale: \[Large one-time legal expense for \] |

| \[settlement of employment matter. \] |

| |

| AI Note: "This transaction matches patterns of one-time |

| legal settlements. High confidence addback candidate." |

| |

| \[ \] Auto-apply to all similar transactions (found 0 others) |

| |

| \[Cancel\] \[Create as Draft Adjustment\] |

+--------------------------------------------------------------+

After clicking Create as Draft Adjustment, the adjustment record is created with status = Draft. It appears in the Adjustments tab where it can be formally approved or rejected through the approval workflow.

# 4\. DYNAMIC VIEW SYSTEM

The Dynamic View System allows users to switch between different analytical perspectives without re-processing data. View switches must be under 500ms for good UX. This requires pre-computation and intelligent caching.

## 4.1 View Dimensions

Users can toggle between different views across these dimensions. Each combination creates a unique analytical perspective:

### 4.1.1 Accounting Basis Toggle

| **Basis** | **How It Works** | **Use Case** |
| --- | --- | --- |
| Accrual (Default) | Revenue recorded when earned, expenses when incurred, regardless of cash movement. This is what the uploaded P&L shows. | Default view. Matches the company's books. Used for most analysis. |
| Cash | Revenue recorded when cash received, expenses when cash paid. Derived by reversing accruals using AR/AP data. | Validates the accrual numbers. Reveals cash collection issues. Useful for cash-intensive businesses. |
| Hybrid / Side-by-Side | Shows both accrual and cash side by side with variances. | Identifies timing differences between when revenue is earned vs collected. |

**Implementation Detail:** The system maintains both accrual and cash versions of each transaction. Cash conversion uses AR/AP aging data to reverse accruals. Pre-compute both views when data is ingested.

### 4.1.2 Data Source Selection

| **Source** | **What It Shows** | **When to Use** |
| --- | --- | --- |
| P&L/BS Uploaded (Default) | The financial statements exactly as uploaded by the user. These are the company's reported numbers. | Default view. This is the source of truth for reported numbers. |
| GL-Derived | Financial statements reconstructed by aggregating GL transactions according to the account mapping. Should match uploaded P&L/BS closely. | Validation. If GL-derived differs from uploaded, something is mapped incorrectly or the GL is incomplete. |
| Bank-Based | Financial view reconstructed from bank statements. Cash-only perspective. | Cross-reference. Differences from GL may indicate missing entries or timing. |
| Comparison | All available sources shown side-by-side with variance columns. | Investigation. Material variances between sources often reveal real issues. |

### 4.1.3 Entity Configuration

| **Mode** | **Behavior** |
| --- | --- |
| Single Entity | Show data for one selected entity only. No aggregation. |
| Consolidated | Sum all entities together. If Eliminate Intercompany is checked, remove IC transactions before summing. |
| Custom | User selects specific entities to include. Useful for partial consolidation. |

## 4.2 View State Data Model

Every time the user changes a toggle, filter, or control, the application builds a ViewState object. This object acts as a cache key for retrieving pre-computed views.

ViewState {

qoe_id: UUID

// Basis Selection

accounting_basis: Enum (Accrual, Cash, Hybrid)

// Source Selection

primary_source: Enum (GL, Bank, ClientFS, Uploaded)

comparison_sources: \[Enum\] // Empty or multiple for comparison

show_variances: Boolean

// Entity Configuration

entity_mode: Enum (Single, Consolidated, Custom)

selected_entities: \[UUID\]

eliminate_intercompany: Boolean

intercompany_accounts: \[String\] // Account codes flagged as IC

// Period Configuration

period_type: Enum (Monthly, Quarterly, Annual, TTM, LTM, Custom)

start_period: Date

end_period: Date

comparison_periods: \[DateRange\] // For YoY, PoP analysis

// Display Options

show_adjustments: Boolean

adjustment_filter: Enum (All, Approved, Suggested, UserUploaded)

currency: String

rounding: Enum (Actual, Thousands, Millions)

}

## 4.3 View Caching Strategy

View switches need to be fast. Here is the caching approach:

| **Strategy** | **When It Happens** | **Details** |
| --- | --- | --- |
| Pre-compute | When data is ingested or adjustments change | Compute all standard view combinations in the background: Accrual/Cash, Uploaded/GL-Derived, per entity, monthly/quarterly/annual. Store in Redis. |
| Cache Key | On every view request | Hash the ViewState object to create a unique cache key. Check Redis first; if hit, return immediately. |
| Lazy Compute | When user picks a custom combination | If the exact ViewState combo is not pre-computed, compute on demand, then cache the result for future use. |
| Invalidation | When source data changes | When a file is re-uploaded, adjustments are approved/rejected, or mappings change, invalidate only the affected cached views (not all). |

# 5\. DRILL-DOWN & ANOMALY SYSTEM

The drill-down system connects every P&L and Balance Sheet number to its underlying GL transactions. The anomaly detection system automatically identifies unusual items. Together, they enable the one-click addback workflow.

## 5.1 P&L to GL Linkage

Here is how the data flows from uploaded files to a drillable Income Statement:

DATA LINKAGE FLOW:

Monthly P&L (Uploaded) GL Detail (Uploaded)

+---------------------+ +---------------------------------------+

| Professional Fees | | Date Account Description Amount |

| March 2023: $45,000 | ----------> | 03/02 6100 Audit Fee $5,000 |

+---------------------+ | 03/10 6100 Legal-Smith $35,000 |

| | 03/15 6100 Tax Prep $3,000 |

| | 03/28 6100 Consulting $2,000 |

v +---------------------------------------+

Account Mapping |

+---------------------+ |

| GL Account 6100 | v

| -> P&L Line: | AI ANOMALY ANALYSIS

| "Professional | +---------------------------------------+

| Fees" | | !! $45K is 3.2x higher than avg |

+---------------------+ | |

| Driver: "Legal-Smith" $35K (78%) |

| Recommendation: Investigate. Strong |

| addback candidate if one-time. |

+---------------------------------------+

## 5.2 Linkage Data Model

These models establish the connection between uploaded P&L line items, GL transactions, and anomaly analysis:

PLLineItem {

line_id: UUID

qoe_id: UUID

// From uploaded P&L

line_name: String // e.g., "Professional Fees"

period: String // e.g., "2023-03"

reported_amount: Decimal // $45,000 (from uploaded P&L file)

// Computed from GL

gl_derived_amount: Decimal // $45,000 (sum of linked GL entries)

gl_variance: Decimal // Should be ~$0 if mapping is correct

// Linked GL entries

linked_gl_entries: \[GLEntryLink\]

// Anomaly detection (computed)

is_anomaly: Boolean

anomaly_type: Enum (LargeVariance, ModerateVariance, NewAccount, Missing, Rounding)

anomaly_score: Float // 0-1, higher = more anomalous

trailing_average: Decimal // Average of prior 3 months

variance_multiple: Float // e.g., 3.2x

// AI analysis (computed)

ai_analysis_id: UUID // Link to AnomalyAnalysis record

// Adjustments applied

adjustment_total: Decimal

adjusted_amount: Decimal // reported_amount +/- adjustments

}

GLEntryLink {

gl_entry_id: UUID

account_code: String

date: Date

description: String

amount: Decimal

vendor_customer: String

// For addback creation from drill-down

is_selected_for_adjustment: Boolean

suggested_adjustment_category: String

ai_analysis: String

}

AnomalyAnalysis {

analysis_id: UUID

line_id: UUID

period: String

// Analysis results

anomaly_detected: Boolean

anomaly_type: String

severity: Enum (Low, Medium, High)

// AI-generated content

summary: String // One-line summary

detailed_analysis: String // Full analysis paragraph

driver_transactions: \[UUID\] // GL entries causing the anomaly

driver_percentage: Float // What % the drivers account for

// Recommendation

is_addback_candidate: Boolean

suggested_category: String

confidence: Float // 0-1

}

## 5.3 Anomaly Detection Logic

Here is the exact algorithm the system runs for each P&L line item in each period:

ANOMALY DETECTION ALGORITHM:

For each P&L line item, for each period:

1\. VARIANCE CHECK

\- Calculate trailing 3-month average (exclude current month)

\- Calculate variance_multiple = current_amount / trailing_average

\- If trailing_average = 0 and current > 0: Flag as NewAccount

\- If trailing_average > 0 and current = 0: Flag as Missing

\- If variance_multiple > 3.0: Flag as HIGH severity (Large Variance)

\- If variance_multiple > 2.0: Flag as MEDIUM severity (Moderate Variance)

\- If variance_multiple > 1.5: Flag as LOW severity (log, no highlight)

2\. GL VARIANCE CHECK

\- Compare reported_amount vs gl_derived_amount

\- If |difference| > $50: Flag as Rounding Issue

\- If |difference| > $500: Flag as Material Mismatch (higher priority)

3\. DRIVER IDENTIFICATION

\- Get all GL transactions for this line/period

\- Sort by absolute amount descending

\- Identify transactions that account for >50% of variance vs average

\- Mark these as 'driver' transactions

4\. AI ANALYSIS (for flagged items only)

\- Send to Anomaly Analysis Agent (see Section 8.2)

\- Input: line name, amount, average, driver transactions

\- Output: summary, detailed analysis, is_addback_candidate, category

\- Store analysis for display in drill-down panel

# 6\. USER ADJUSTMENT SYSTEM

Adjustments can enter the system through four paths. All adjustments, regardless of source, go through the same approval workflow.

## 6.1 Adjustment Sources

| **Source** | **How It Enters** | **Example** |
| --- | --- | --- |
| AI Detected | System automatically identifies potential addbacks from GL anomaly analysis. | AI flags a $175K owner salary as above market benchmark. |
| User Drill-Down | User clicks into P&L, selects transactions, clicks Add as Adjustment. | User sees a $35K legal settlement in the drill-down and creates addback. |
| User Upload (Excel) | User fills out the Excel adjustment template and uploads it. | Analyst has external workpapers with adjustments they want to import. |
| Manual Entry | User manually creates an adjustment via a form. | User knows about an adjustment that is not visible in the data. |
| Rule-Based | System applies predefined rules (e.g., always add back stock comp). | Non-cash stock compensation is automatically suggested as addback. |

## 6.2 Excel Import Template

Users can download a standardized Excel template, fill in their adjustments in Excel (where they are comfortable), and upload it. The system validates and imports each row as a Draft adjustment.

### 6.2.1 Template Structure

Sheet 1: "Adjustments"

+------------+--------------+-------------+---------------+------------+--------------+

| Category | Description | Amount | Period | Rationale | Support Ref |

+------------+--------------+-------------+---------------+------------+--------------+

| Owner Comp | Above market | 175,000 | FY2023 | Benchmark | Exhibit A |

| One-Time | Legal settle | 85,000 | Jul-2023 | Settlement | Invoice #123 |

| Related | Rent adj | 24,000 | FY2023 | Market cmp | Lease review |

+------------+--------------+-------------+---------------+------------+--------------+

Sheet 2: "Period Bridge" (Optional - for reference)

+--------------------+------------+------------+------------+------------+

| Line Item | Reported | Adjustment | Adjusted | Notes |

+--------------------+------------+------------+------------+------------+

| Revenue | 5,250,000 | - | 5,250,000 | |

| Gross Profit | 2,100,000 | - | 2,100,000 | |

| EBITDA (Reported) | 420,000 | - | 420,000 | |

| + Owner Comp Adj | - | 175,000 | 175,000 | Above mkt |

| + One-Time Legal | - | 85,000 | 85,000 | Settlement |

| EBITDA (Adjusted) | - | - | 680,000 | |

+--------------------+------------+------------+------------+------------+

Sheet 3: "Category Mapping" (Reference - valid categories listed)

### 6.2.2 Import Validation Rules

| **Field** | **Validation** | **If Fails** |
| --- | --- | --- |
| Category | Must match one of the allowed categories (see Appendix A) | ERROR - row rejected, message shown |
| Description | Required, must not be empty | ERROR - row rejected |
| Amount | Must be numeric, must not be zero | ERROR - row rejected |
| Period | Must match one of the engagement's analysis periods | WARNING - imported but flagged |
| Rationale | Recommended but not required | WARNING - no rationale provided |
| Duplicate Check | Compare to existing adjustments (same category + period + similar amount) | WARNING - possible duplicate flagged |

## 6.3 EBITDA Bridge Generation

The system automatically generates the EBITDA Bridge from all approved adjustments. This is the key deliverable of the QoE analysis. Here is what it looks like:

EBITDA BRIDGE (Auto-Generated from Approved Adjustments)

FY 2023 TTM Notes

\--------- --------- -----------------

Reported Net Income $ 285,000 $ 310,000

\+ Interest Expense 45,000 42,000

\+ Income Tax Expense 65,000 72,000

\+ Depreciation 85,000 88,000

\+ Amortization 12,000 12,000

\---------- ----------

REPORTED EBITDA $ 492,000 $ 524,000

ADJUSTMENTS:

\[AI\] Owner Compensation $ 175,000 $ 175,000 Above market rate

\[Drill\] One-Time Legal 35,000 - Smith settlement

\[User\] Related Party Rent 24,000 24,000 Above market

\[User\] COVID Grant Revenue (50,000) - Non-recurring

\[Rule\] Stock Compensation 35,000 38,000 Non-cash

\---------- ----------

TOTAL ADJUSTMENTS $ 219,000 $ 237,000

\========== ==========

ADJUSTED EBITDA $ 711,000 $ 761,000

\========== ==========

\[AI\] = AI-Detected, \[Drill\] = Drill-Down, \[User\] = User Upload, \[Rule\] = Rule-Based

## 6.4 Approval Workflow

Every adjustment, regardless of source, must go through this workflow before it affects the Adjusted EBITDA calculation:

ADJUSTMENT APPROVAL WORKFLOW:

+----------+ +----------+ +----------+ +----------+

| DETECTED |---->| PENDING |---->| REVIEWED |---->| APPROVED |

| (Draft) | | (Queue) | | (Decide) | | (Final) |

+----------+ +----------+ +----------+ +----------+

| |

| +----+----+

| v v

| +----------+ +----------+

| | MODIFIED | | REJECTED |

| +----------+ +----------+

| |

+-----------+

(Returns to queue)

Actions:

\- Draft -> Pending: Automatic when created

\- Pending -> Reviewed: Analyst opens for review

\- Reviewed -> Approved: Accept as-is (amount unchanged)

\- Reviewed -> Modified: Change amount, update rationale, re-enter queue

\- Reviewed -> Rejected: Decline with required reason

# 7\. DATA MODELS

This section defines every data model in the system. Models are organized by domain. Every field is documented. If you are implementing the database schema, these models are your schema definition.

## 7.1 Core Engagement

QoEEngagement {

qoe_id: UUID (primary key)

client_id: UUID (foreign key, partition key)

// Engagement info

deal_name: String // e.g., "Acme Corp QoE"

deal_type: Enum (SellSide, BuySide, Refinancing, Internal)

target_close_date: Date // Expected close date of the deal

// Company info

industry_code: String (NAICS) // North American Industry Classification

industry_vertical: String // e.g., "Construction", "SaaS"

company_size_tier: Enum (Small, LowerMiddle, UpperMiddle, Large)

// Multi-entity configuration

entities: \[Entity\]

consolidation_method: Enum (None, Full, Proportional)

functional_currency: String // e.g., "USD"

// Analysis periods

analysis_periods: \[Period\]

fiscal_year_end: String (MM-DD) // e.g., "12-31"

// Status tracking

status: Enum (Setup, DataCollection, Validation, Analysis, Review, Final)

status_updated_at: Timestamp

// Audit

created_by: UUID

created_at: Timestamp

updated_at: Timestamp

}

Entity {

entity_id: UUID

qoe_id: UUID

legal_name: String

entity_type: Enum (LLC, Corp, Partnership, SoleProp)

ownership_percentage: Decimal // e.g., 100.0 or 51.0

include_in_consolidation: Boolean

is_primary: Boolean

}

Period {

period_id: String // e.g., "2023-01", "FY2023"

period_type: Enum (Month, Quarter, Year)

start_date: Date

end_date: Date

label: String // e.g., "January 2023"

}

## 7.2 Uploaded Files

UploadedFile {

file_id: UUID

qoe_id: UUID

entity_id: UUID

// File info

file_type: Enum (MonthlyPL, MonthlyBS, GLDetail, TrialBalance,

BankStatement, ARaging, APaging, Other)

filename: String

file_path: String (S3 path)

file_size: Integer

checksum: String // SHA256 for integrity

// Processing status

parse_status: Enum (Pending, Processing, Completed, Failed)

parse_errors: \[String\]

// Metadata

uploaded_by: UUID

uploaded_at: Timestamp

}

## 7.3 Monthly P&L

MonthlyPL {

pl_id: UUID

qoe_id: UUID

entity_id: UUID

source_file_id: UUID

period: String (YYYY-MM)

// Line items as uploaded

line_items: \[PLLineItem\]

// Totals (for quick access, computed from line items)

total_revenue: Decimal

gross_profit: Decimal

operating_income: Decimal

net_income: Decimal

ebitda_reported: Decimal

ebitda_adjusted: Decimal

}

PLLineItem {

line_id: UUID

pl_id: UUID

// From uploaded file

line_name: String

line_category: Enum (Revenue, COGS, GrossProfit, OpEx, OtherIncome,

OtherExpense, Interest, Tax, NetIncome, EBITDA)

reported_amount: Decimal

display_order: Integer // For rendering in correct order

indent_level: Integer // 0=top-level, 1=sub-item, 2=sub-sub

is_subtotal: Boolean // Is this a calculated subtotal row?

// Mapped to standard taxonomy

standard_category_code: String

// GL linkage (computed after account mapping)

gl_account_codes: \[String\] // Which GL accounts map to this line

gl_derived_amount: Decimal // Sum of linked GL entries

gl_variance: Decimal // reported - gl_derived

// Anomaly detection (computed)

is_anomaly: Boolean

anomaly_type: String

anomaly_severity: Enum (Low, Medium, High)

trailing_3m_average: Decimal

variance_multiple: Float

// AI analysis reference

ai_analysis_id: UUID

// Adjustment impact

adjustment_total: Decimal

adjusted_amount: Decimal

}

## 7.4 Monthly Balance Sheet

MonthlyBS {

bs_id: UUID

qoe_id: UUID

entity_id: UUID

source_file_id: UUID

period: String (YYYY-MM)

as_of_date: Date

line_items: \[BSLineItem\]

total_assets: Decimal

total_liabilities: Decimal

total_equity: Decimal

current_assets: Decimal

current_liabilities: Decimal

net_working_capital: Decimal

}

BSLineItem {

line_id: UUID

bs_id: UUID

line_name: String

line_category: Enum (CurrentAsset, NonCurrentAsset, CurrentLiability,

NonCurrentLiability, Equity)

reported_amount: Decimal

display_order: Integer

indent_level: Integer

is_subtotal: Boolean

// Same linkage and anomaly fields as PLLineItem

standard_category_code: String

gl_account_codes: \[String\]

gl_derived_amount: Decimal

gl_variance: Decimal

is_anomaly: Boolean

anomaly_type: String

anomaly_severity: Enum

prior_period_amount: Decimal

change_amount: Decimal

change_percent: Float

}

## 7.5 General Ledger

GLDetail {

gl_id: UUID

qoe_id: UUID

entity_id: UUID

source_file_id: UUID

// Period coverage

period_start: Date

period_end: Date

// Entries

entries: \[GLEntry\]

entry_count: Integer

// Validation

total_debits: Decimal

total_credits: Decimal

is_balanced: Boolean // total_debits == total_credits

}

GLEntry {

entry_id: UUID

gl_id: UUID

// Core fields

date: Date

account_code: String

account_name: String

description: String

memo: String

reference: String

// Amounts

debit: Decimal

credit: Decimal

amount: Decimal // Net: debit - credit

// Classification

vendor_customer: String

department: String

class: String

location: String

// Linkage (set after account mapping)

mapped_pl_line_id: UUID // Which P&L line this rolls up to

mapped_bs_line_id: UUID // Which BS line (if applicable)

// Flags

is_intercompany: Boolean

intercompany_entity_id: UUID

is_adjustment_candidate: Boolean

adjustment_candidate_category: String

// Source tracking

source_row: Integer // Row number from uploaded file

}

## 7.6 Bank Statement

BankStatement {

statement_id: UUID

qoe_id: UUID

entity_id: UUID

upload_id: UUID

// Bank info

bank_name: String

account_type: Enum (Checking, Savings, MoneyMarket)

account_number_masked: String // Last 4 digits only

// Period

statement_date: Date

period_start: Date

period_end: Date

// Balances

opening_balance: Decimal

closing_balance: Decimal

// Transactions

transactions: \[BankTransaction\]

transaction_count: Integer

// Reconciliation

gl_account_code: String // Mapped GL cash account

gl_reconciliation_status: Enum (Pending, Reconciled, Variance)

gl_variance: Decimal

// OCR info (if parsed from PDF)

ocr_confidence: Float

ocr_requires_review: Boolean

checksum: String

uploaded_at: Timestamp

}

BankTransaction {

transaction_id: String

date: Date

description: String

amount: Decimal // Positive = deposit, Negative = withdrawal

running_balance: Decimal

transaction_type: Enum (Deposit, Withdrawal, Transfer, Fee, Interest)

check_number: String

// Matching to GL

matched_gl_entry_id: String

match_confidence: Float

match_status: Enum (Unmatched, AutoMatched, ManualMatched)

}

## 7.7 Account Mapping

AccountMapping {

mapping_id: UUID

qoe_id: UUID

entity_id: UUID

// Source (from GL)

gl_account_code: String

gl_account_name: String

// Target (to P&L or BS line)

target_type: Enum (PL, BS)

target_line_name: String

standard_category_code: String

// Mapping metadata

mapping_method: Enum (Exact, Pattern, AI, Manual)

mapping_confidence: Float

is_confirmed: Boolean

confirmed_by: UUID

confirmed_at: Timestamp

}

## 7.8 Adjustments

Adjustment {

adjustment_id: UUID

qoe_id: UUID

entity_id: UUID

// Source tracking

source: Enum (AI_Detected, User_DrillDown, User_Upload, Manual_Entry, Rule_Based)

source_reference: String // File name, rule ID, or AI suggestion ID

// If created from drill-down

source_line_id: UUID // P&L or BS line clicked

source_gl_entries: \[UUID\] // Specific GL entries selected

// Core data

category: String // From Appendix A taxonomy

subcategory: String

description: String

// Amounts

amount: Decimal

period_type: Enum (Single, Range, Annual, AllPeriods)

affected_periods: \[String\]

// P&L impact

affects_line_id: UUID

ebitda_impact: Decimal // Positive = increases EBITDA

// Supporting information

rationale: String

supporting_documents: \[DocumentRef\]

ai_analysis: String

ai_confidence: Float

// GL account impacts

gl_account_impacts: \[AccountImpact\]

// Approval workflow

status: Enum (Draft, Pending, Approved, Rejected, Modified)

suggested_amount: Decimal // Original amount if modified

approved_amount: Decimal // Final approved amount

approved_by: UUID

approved_at: Timestamp

approval_notes: String

// Audit

created_by: UUID

created_at: Timestamp

version: Integer

previous_version_id: UUID

}

AccountImpact {

account_code: String

account_name: String

debit_credit: Enum (Debit, Credit)

amount: Decimal

}

## 7.9 Normalized Financials

These are computed views of the financial data. They represent the result of applying account mappings, adjustments, and view parameters to the raw data.

NormalizedFinancials {

normalized_id: UUID

qoe_id: UUID

entity_id: UUID // NULL for consolidated

// View parameters that generated this

view_state: ViewState // The exact view config

// Statement type

statement_type: Enum (IncomeStatement, BalanceSheet, CashFlow)

// Period

period: Period

// Data

line_items: \[NormalizedLineItem\]

// Totals

total_revenue: Decimal

gross_profit: Decimal

operating_income: Decimal

ebitda_reported: Decimal

ebitda_adjusted: Decimal

net_income: Decimal

// Source tracking

primary_source: Enum (GL, Bank, ClientFS, Uploaded)

source_document_ids: \[UUID\]

// Version

version: Integer

computed_at: Timestamp

is_current: Boolean

}

NormalizedLineItem {

line_id: String

// Standard taxonomy position

category_code: String

category_name: String

display_order: Integer

indent_level: Integer

is_subtotal: Boolean

is_total: Boolean

// Amounts

amount: Decimal

prior_period_amount: Decimal

variance: Decimal

variance_percent: Float

// Source tracing

source_accounts: \[SourceAccountTrace\]

mapping_method: Enum (Direct, Aggregated, Calculated, Manual)

}

SourceAccountTrace {

account_code: String

account_name: String

amount: Decimal

source_type: Enum (GL, Bank, ClientFS, Uploaded)

source_document_id: UUID

}

## 7.10 EBITDA Bridge

EBITDABridge {

bridge_id: UUID

qoe_id: UUID

as_of: Timestamp

// Starting point

reported_net_income: Decimal

interest_expense: Decimal

income_tax: Decimal

depreciation: Decimal

amortization: Decimal

reported_ebitda: Decimal

// QoE adjustments by category

adjustments_by_category: \[{

category: String

items: \[{

description: String

amount: Decimal

adjustment_id: UUID

source: Enum

}\]

subtotal: Decimal

}\]

total_adjustments: Decimal

adjusted_ebitda: Decimal

// Monthly breakdown

period_detail: \[{

period: String

reported_ebitda: Decimal

adjustments: Decimal

adjusted_ebitda: Decimal

}\]

}

## 7.11 Phase 2 & 3 Data Models

These models are introduced in later phases but are documented here for completeness:

// Phase 2: Multi-entity & Reconciliation

IntercompanyMapping {

mapping_id: UUID

entity_a_id: UUID

entity_b_id: UUID

account_code_a: String // Account in Entity A

account_code_b: String // Offsetting account in Entity B

is_confirmed: Boolean // User verified this is IC

}

ClientProvidedFS {

fs_id: UUID

qoe_id: UUID

statement_type: Enum (PL, BS)

period: Period

line_items: \[LineItem\] // As provided by client

source_file_id: UUID

}

SourceReconciliation {

recon_id: UUID

qoe_id: UUID

period: Period

line_item: String

gl_amount: Decimal

bank_amount: Decimal

client_fs_amount: Decimal

uploaded_pl_amount: Decimal

variance_gl_uploaded: Decimal

variance_gl_bank: Decimal

variance_gl_client: Decimal

is_material: Boolean // Variance > materiality threshold

}

// Phase 3: Advanced Analysis

RevenueAnalysis {

analysis_id: UUID

qoe_id: UUID

top_customers: \[CustomerConcentration\]

concentration_score: Enum (Low, Medium, High) // Top customer > 20% = High

trend_analysis: JSONB // MoM, YoY growth rates

}

CustomerConcentration {

customer_name: String

revenue: Decimal

percentage: Float

trend: Enum (Growing, Stable, Declining)

}

WorkingCapitalAnalysis {

analysis_id: UUID

qoe_id: UUID

nwc_schedule: \[PeriodNWC\]

ar_days: Float // Days Sales Outstanding

ap_days: Float // Days Payable Outstanding

inventory_days: Float // Days Inventory on Hand

recommended_peg: Decimal // Suggested NWC target

}

PeriodNWC {

period: String

current_assets: Decimal

current_liabilities: Decimal

nwc: Decimal

nwc_as_pct_revenue: Float

}

# 8\. AI AGENT SPECIFICATIONS

The system uses multiple AI agents, each specialized for a specific task. Each agent is implemented as a Claude API call with a specific system prompt, structured input, and structured output. This section provides the complete specification for every agent.

**Developer Note:** These agents call the Claude API. Each API call costs money and takes 2-5 seconds. Do not call agents in a loop for every transaction. Batch requests where possible, and only call the AI for flagged items.

| **Agent #** | **Agent Name** | **Purpose** | **Phase** | **Called When** |
| --- | --- | --- | --- | --- |
| 1   | Validation Agent | Verify data completeness and consistency | 1   | After file upload |
| 2   | Account Mapping Agent | Map GL accounts to P&L/BS categories | 1   | After GL upload, for unmapped accounts |
| 3   | Anomaly Analysis Agent | Analyze P&L variances and identify drivers | 1   | After anomaly detection, for flagged items |
| 4   | Addback Detection Agent | Identify potential EBITDA adjustments from GL | 1   | After mapping and normalization |
| 5   | Normalization Agent | Standardize P&L/BS format from various layouts | 1   | After file parsing, if format is non-standard |
| 6   | Revenue Analysis Agent | Analyze revenue quality and concentration | 3   | On demand from Revenue Analysis tab |
| 7   | Working Capital Agent | Analyze NWC trends and recommend peg | 4   | On demand from Working Capital tab |
| 8   | Report Generation Agent | Generate narrative QoE report sections | 4   | When user generates report |

## 8.1 Agent 1: Validation Agent

Purpose: Verify completeness, structure, and consistency of uploaded financial data before processing begins.

### 8.1.1 Input

{

"qoe_id": "uuid",

"uploaded_files": \[

{ "type": "MonthlyPL", "file_id": "uuid", "entity_id": "uuid" },

{ "type": "GLDetail", "file_id": "uuid", "entity_id": "uuid" },

{ "type": "MonthlyBS", "file_id": "uuid", "entity_id": "uuid" }

\],

"expected_periods": \["2023-01", "2023-02", ..., "2023-12"\],

"expected_entities": \["uuid1"\]

}

### 8.1.2 Validation Checks

| **Check** | **What It Verifies** | **Result Type** |
| --- | --- | --- |
| Completeness | Are all expected periods present in each file type? | Blocking Error if missing |
| GL Balance | Do total Debits = total Credits in the GL? | Blocking Error if unbalanced |
| TB Tie | Does the Trial Balance total tie to the GL totals? | Warning if off by > $100 |
| P&L to GL | Do P&L totals match the GL when aggregated by account mapping? | Warning with variance detail |
| Period Coverage | Does the GL cover the same periods as the P&L? | Blocking Error if gaps |
| Duplicate Check | Are there duplicate entries (same date, amount, description)? | Warning with duplicates listed |
| Format Check | Are required columns present? Are amounts numeric? | Blocking Error if malformed |

### 8.1.3 Output

{

"validation_status": "INCOMPLETE | VALID | INVALID",

"can_proceed": boolean, // false if blocking errors exist

"blocking_issues": \[

{ "check": "Completeness", "detail": "Missing GL for Apr-Jun 2023" }

\],

"warnings": \[

{ "check": "TB Tie", "detail": "Mar TB off by $12.50 vs GL" }

\],

"required_to_proceed": \[

"Upload GL for Apr-Jun 2023"

\],

"summary": {

"files_validated": 5,

"periods_covered": 9,

"entities_covered": 1

}

}

## 8.2 Agent 2: Account Mapping Agent

Purpose: Suggest mappings from GL account codes/names to standard P&L or Balance Sheet categories. The AI sees the account name and sample transactions, then suggests the most appropriate category.

### 8.2.1 System Prompt

SYSTEM PROMPT:

"You are a financial analyst assistant. Map GL accounts to standard

financial statement categories.

Standard P&L Categories:

\- Revenue (REV)

\- Cost of Goods Sold (COGS)

\- Payroll & Benefits (OPEX-PAY)

\- Rent & Occupancy (OPEX-RENT)

\- Professional Services (OPEX-PRO)

\- Marketing & Sales (OPEX-MKT)

\- Insurance (OPEX-INS)

\- Utilities (OPEX-UTIL)

\- Other Operating Expenses (OPEX-OTH)

\- Depreciation (DA)

\- Amortization (DA)

\- Interest Expense (INT)

\- Interest Income (INT)

\- Other Income (OI)

\- Other Expense (OE)

\- Income Tax (TAX)

Standard BS Categories:

\- Cash & Equivalents (CA-CASH)

\- Accounts Receivable (CA-AR)

\- Inventory (CA-INV)

\- Prepaid Expenses (CA-PRE)

\- Other Current Assets (CA-OTH)

\- Property & Equipment (NCA-PPE)

\- Intangible Assets (NCA-INT)

\- Other Non-Current Assets (NCA-OTH)

\- Accounts Payable (CL-AP)

\- Accrued Expenses (CL-ACC)

\- Current Debt (CL-DEBT)

\- Other Current Liabilities (CL-OTH)

\- Long-Term Debt (NCL-DEBT)

\- Other Non-Current Liabilities (NCL-OTH)

\- Common Stock (EQ-STOCK)

\- Retained Earnings (EQ-RE)

\- Other Equity (EQ-OTH)

Provide top 3 suggestions with confidence scores.

Respond in JSON only."

### 8.2.2 Input/Output Format

INPUT:

{

"account_code": "6100",

"account_name": "Legal and Professional Fees",

"sample_transactions": \[

{"description": "Smith & Associates - Legal", "amount": 35000},

{"description": "Annual Audit Fee", "amount": 5000}

\]

}

OUTPUT:

{

"suggestions": \[

{"code": "OPEX-PRO", "name": "Professional Services", "confidence": 0.95},

{"code": "OPEX-OTH", "name": "Other Operating Expenses", "confidence": 0.04},

{"code": "COGS", "name": "Cost of Goods Sold", "confidence": 0.01}

\],

"reasoning": "Account name explicitly mentions 'Legal and Professional Fees'

and sample transactions show legal and audit expenses."

}

## 8.3 Agent 3: Anomaly Analysis Agent

Purpose: Analyze P&L line item anomalies and provide human-readable insights. Called only for items that passed the variance threshold in the anomaly detection algorithm (Section 5.3).

### 8.3.1 System Prompt

SYSTEM PROMPT:

"You are a financial analyst specializing in Quality of Earnings analysis.

Your job is to analyze unusual variances in financial data and determine

if they represent potential EBITDA adjustments (addbacks).

You will receive:

1\. A P&L line item with an unusual variance

2\. The GL transactions that make up that line item

3\. Historical context (trailing averages)

You must provide:

1\. A one-line summary of the anomaly

2\. A detailed analysis paragraph (2-4 sentences)

3\. Identification of the driver transaction(s)

4\. Whether this is an addback candidate

5\. If yes, the suggested adjustment category

RULES:

\- Be specific about dollar amounts and percentages

\- Identify the specific transaction(s) causing the variance

\- Consider common QoE adjustment categories:

Owner Comp, One-Time Legal, Non-Recurring, Related Party,

COVID-Related, Non-Cash Items

\- If uncertain, say so and recommend investigation

\- Never fabricate information not in the data

\- Respond in JSON only."

### 8.3.2 Input/Output Format

INPUT:

{

"line_name": "Professional Fees",

"period": "March 2023",

"current_amount": 45000,

"trailing_3m_average": 14000,

"variance_multiple": 3.21,

"transactions": \[

{"date": "2023-03-10", "description": "Legal - Smith", "amount": 35000,

"vendor": "Smith & Associates LLP"},

{"date": "2023-03-02", "description": "Audit Fee", "amount": 5000},

{"date": "2023-03-15", "description": "Tax Prep", "amount": 3000},

{"date": "2023-03-28", "description": "Consulting", "amount": 2000}

\]

}

OUTPUT:

{

"summary": "March Prof Fees 3.2x avg, driven by $35K legal payment",

"detailed_analysis": "Professional Fees of $45,000 in March are

significantly elevated compared to the trailing 3-month average of

$14,000. This is primarily driven by a single $35,000 payment to Smith

& Associates (78% of total). The remaining $10,000 appears to be normal

recurring professional fees.",

"driver_transactions": \["Legal - Smith"\],

"driver_percentage": 0.78,

"is_addback_candidate": true,

"suggested_category": "One-Time - Legal",

"confidence": 0.85,

"investigation_notes": "Confirm nature of engagement. If settlement or

litigation, strong addback. If new ongoing retainer, may not qualify."

}

## 8.4 Agent 4: Addback Detection Agent

Purpose: Proactively scan the entire GL to identify potential EBITDA adjustments, even for items that may not trigger the simple variance threshold. This agent looks for patterns, not just spikes.

### 8.4.1 Detection Categories

| **Category** | **What to Look For** | **Typical Confidence** |
| --- | --- | --- |
| Owner Compensation | Salary payments to owners/executives exceeding market benchmarks. Look for names matching company officers, payments above $200K/year. | HIGH (if owner identified) |
| One-Time Legal | Large, infrequent payments to law firms. Settlement payments. Litigation costs. | HIGH (if clearly non-recurring) |
| Related Party | Transactions with entities sharing owner/officer names. Above-market rent to owner-related LLCs. Management fees to holding companies. | MEDIUM (needs verification) |
| Non-Recurring | Items that appear only once in the analysis period. COVID grants, insurance settlements, restructuring costs. | HIGH (for clearly one-time items) |
| Non-Cash | Stock compensation, unrealized gains/losses, asset write-downs. | HIGH (objectively non-cash) |
| Discretionary | Expenses at owner discretion: luxury travel, country club memberships, vehicle expenses that may be personal. | LOW (subjective, needs review) |

### 8.4.2 Confidence Calibration

| **Level** | **Criteria** | **Action** |
| --- | --- | --- |
| HIGH (0.8-1.0) | Clear evidence, objective measurement, common pattern. Example: Owner salary clearly identified, benchmark available. | Present to user as strong recommendation. Pre-check the Add as Adjustment checkbox. |
| MEDIUM (0.5-0.79) | Good evidence but requires context or judgment. Example: Large legal payment looks one-time but needs verification. | Present to user as suggestion. Do not pre-check. |
| LOW (0.3-0.49) | Suggestive but significant uncertainty. Example: Vendor name suggests related party but not confirmed. | Present to user as item to investigate. Flag for review only. |
| Below 0.3 | Insufficient evidence. | Do NOT suggest. Do not show to user. |

### 8.4.3 Critical Rules for Addback Detection

| **Rule** | **Details** |
| --- | --- |
| NEVER suggest without evidence | Every suggestion must cite specific GL entries or documents from the uploaded data. |
| ALWAYS cite specific transactions | Include entry IDs, dates, amounts, descriptions as evidence. |
| ALWAYS flag owner-related items | Any transaction involving names matching company officers should be flagged regardless of confidence. |
| NEVER auto-approve | All suggestions enter as Draft status. Only humans can approve. |
| Do not fabricate benchmarks | If no benchmark data is available, state that and recommend the user provide one. |

## 8.5 Agent 5: Normalization Agent

Purpose: Standardize financial statement formats. Different companies present their P&L and BS in wildly different layouts. This agent identifies the structure of an uploaded file and maps it to our standard format.

This agent is called during file parsing when the system cannot auto-detect the layout. It examines sample rows and suggests which column is which, where headers are, and how to interpret negative numbers (parentheses vs minus signs).

## 8.6 Agent 6: Revenue Analysis Agent

Purpose: Analyze revenue quality, customer concentration, and trends. Generates narrative insights for the Revenue Analysis tab and report section.

### 8.6.1 Analysis Performed

| **Analysis** | **What It Does** |
| --- | --- |
| Customer Concentration | Identifies top 5/10 customers by revenue. Flags concentration risk if any single customer > 20% of revenue. |
| Revenue Trend | Calculates MoM and YoY growth rates. Identifies seasonality patterns. Flags if revenue is declining. |
| Revenue Quality | Categorizes revenue as recurring vs one-time. Identifies quality indicators (long-term contracts vs spot sales). |
| Revenue Bridge | Explains period-over-period revenue changes: new customers, lost customers, expansion, contraction. |

## 8.7 Agent 7: Working Capital Agent

Purpose: Analyze Net Working Capital (NWC) trends and recommend a working capital peg for the deal.

**What is a Working Capital Peg?:** In M&A deals, the buyer and seller agree on a target level of working capital the business needs to operate. If actual NWC at closing is above the peg, the buyer pays more. If below, the buyer pays less. Our system helps determine what the right peg should be.

### 8.7.1 Analysis Performed

| **Metric** | **Calculation** | **Why It Matters** |
| --- | --- | --- |
| Net Working Capital | Current Assets - Current Liabilities (excluding cash, debt, and tax items) | Shows how much capital is tied up in operations. |
| Days Sales Outstanding (DSO) | (Average AR / Revenue) x Days in Period | How fast customers pay. Higher = more cash tied up. |
| Days Payable Outstanding (DPO) | (Average AP / COGS) x Days in Period | How fast the company pays suppliers. Higher = less cash needed. |
| Days Inventory Outstanding (DIO) | (Average Inventory / COGS) x Days in Period | How long inventory sits on shelf before selling. |
| Cash Conversion Cycle | DSO + DIO - DPO | Total days from paying suppliers to collecting from customers. |
| NWC as % of Revenue | NWC / Revenue | Normalized metric to set the peg. Typical: 10-15% of revenue. |

## 8.8 Agent 8: Report Generation Agent

Purpose: Generate draft narrative sections of the QoE report. The report is the final deliverable sent to the buyer.

### 8.8.1 Report Sections Generated

| **Section** | **Content** | **Data Sources** |
| --- | --- | --- |
| Executive Summary | Key findings, Adjusted EBITDA, significant adjustments, risk factors. | EBITDA Bridge, Adjustments, Revenue Analysis |
| Revenue Analysis | Revenue quality assessment, concentration analysis, trend narrative. | Revenue Analysis Agent output |
| EBITDA Bridge | Detailed walkthrough from reported to adjusted, with explanations. | Approved Adjustments, MonthlyPL |
| Adjustment Schedule | Complete list of all adjustments with categories, amounts, rationale, and supporting evidence. | Adjustment records |
| Working Capital | NWC analysis, peg recommendation, seasonal patterns. | Working Capital Agent output, MonthlyBS |
| Appendices | Source data summaries, GL excerpts, supporting calculations. | All source data |

### 8.8.2 Traceability Requirements

| **Requirement** | **Details** |
| --- | --- |
| Number traceability | Every number in the report must link to a source record (GL entry, uploaded P&L line, or calculation). |
| Adjustment traceability | Every adjustment in the report must link to the approval record with approver, date, and rationale. |
| Narrative traceability | Every claim in the narrative must be supported by data from the analysis. |
| Version control | Every report version is preserved. Changes between versions are tracked. |

# 9\. GOVERNANCE & CONTROLS

This section defines the security, access control, and audit requirements for the platform.

## 9.1 Role-Based Access Control (RBAC)

| **Role** | **Create Engagement** | **Upload Files** | **Map Accounts** | **Create Adjustments** | **Approve Adjustments** | **Generate Report** | **Admin Settings** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Analyst | Yes | Yes | Yes | Yes | No  | Yes | No  |
| Senior Analyst | Yes | Yes | Yes | Yes | Yes | Yes | No  |
| Manager | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Viewer | No  | No  | No  | No  | No  | View Only | No  |

## 9.2 Audit Trail Requirements

Every action in the system is logged immutably. The audit trail supports both compliance and reproducibility. A buyer should be able to look at the audit trail and understand exactly how every number was derived.

| **What Is Logged** | **Details Captured** |
| --- | --- |
| All file uploads | User, timestamp, filename, file type, checksum, parse result |
| All account mapping changes | User, timestamp, account, old mapping, new mapping |
| All adjustment lifecycle events | User, timestamp, action (create/modify/approve/reject), before state, after state, rationale |
| All view state changes | User, timestamp, view parameters (for reproducibility) |
| All report versions | User, timestamp, version number, changes from prior version |

Audit logs are append-only. No audit record may be deleted or modified. Audit records should include before/after state for any data change.

## 9.3 Escalation Rules

| **Condition** | **Escalation Action** |
| --- | --- |
| Single adjustment > $500K | Requires Manager approval (cannot be approved by Analyst or Senior Analyst) |
| Total adjustments > 50% of Reported EBITDA | System warns user and flags for Manager review |
| AI confidence < 0.5 on a flagged adjustment | Marked as Needs Investigation, cannot be auto-approved |
| GL does not balance (Debits != Credits) | Blocks processing until resolved or overridden by Manager |
| P&L to GL variance > 5% | Requires written explanation before proceeding |

# 10\. API SPECIFICATIONS

Complete API endpoint specifications. All endpoints use REST conventions, accept/return JSON, and require authentication. Base URL: /api/v1.

## 10.1 Engagement Endpoints

POST /api/v1/engagements Create new engagement

GET /api/v1/engagements List all engagements

GET /api/v1/engagements/{qoe_id} Get engagement details

PUT /api/v1/engagements/{qoe_id} Update engagement

DELETE /api/v1/engagements/{qoe_id} Delete engagement

## 10.2 File Upload Endpoints

POST /api/v1/engagements/{qoe_id}/files Upload file (multipart)

GET /api/v1/engagements/{qoe_id}/files List uploaded files

GET /api/v1/files/{file_id} Get file details + status

GET /api/v1/files/{file_id}/status Get parse status only

DELETE /api/v1/files/{file_id} Delete file

## 10.3 Validation Endpoints

GET /api/v1/engagements/{qoe_id}/validation Get validation status

POST /api/v1/engagements/{qoe_id}/validate Trigger validation

## 10.4 Account Mapping Endpoints

GET /api/v1/engagements/{qoe_id}/accounts List all GL accounts

PUT /api/v1/engagements/{qoe_id}/accounts/{code} Update mapping

POST /api/v1/engagements/{qoe_id}/accounts/suggest Get AI mapping suggestions

POST /api/v1/engagements/{qoe_id}/accounts/bulk-map Bulk update mappings

## 10.5 Income Statement Endpoint

GET /api/v1/engagements/{qoe_id}/income-statement

Query params:

entity_id: UUID (optional)

start_period: "2023-01" (optional)

end_period: "2023-12" (optional)

basis: "accrual" | "cash" (default: accrual)

include_adjustments: true/false

include_anomalies: true/false

Response:

{

"periods": \["2023-01", "2023-02", ...\],

"line_items": \[

{

"line_id": "uuid",

"line_name": "Revenue",

"line_category": "Revenue",

"display_order": 1,

"amounts": {

"2023-01": {

"reported": 125000,

"adjusted": 125000,

"gl_derived": 125000,

"anomaly": null

},

"2023-03": {

"reported": 198500,

"adjusted": 181500,

"gl_derived": 198500,

"anomaly": { "type": "LargeVariance", "severity": "High",

"variance_multiple": 3.2 }

}

},

"ytd": { "reported": 1540000 },

"ttm": { "reported": 1680000 }

}

\],

"totals": {

"revenue": { "ytd": 2162000 },

"ebitda_reported": { "ytd": 492000 },

"ebitda_adjusted": { "ytd": 702000 }

}

}

## 10.6 Drill-Down Endpoint

GET /api/v1/engagements/{qoe_id}/drill-down

Query params:

line_id: UUID (required)

period: "2023-03" (required)

Response:

{

"line_name": "Professional Fees",

"period": "2023-03",

"reported_amount": 45000,

"gl_derived_amount": 45000,

"anomaly": {

"detected": true,

"severity": "High",

"trailing_average": 14000,

"variance_multiple": 3.2

},

"ai_analysis": {

"summary": "March Prof Fees 3.2x higher than average",

"detailed_analysis": "...",

"is_addback_candidate": true,

"suggested_category": "One-Time - Legal",

"confidence": 0.85

},

"transactions": \[

{

"entry_id": "uuid",

"date": "2023-03-10",

"description": "Legal - Smith & Associates",

"vendor_customer": "Smith & Associates LLP",

"amount": 35000,

"is_driver": true,

"suggested_adjustment": {

"category": "One-Time - Legal",

"confidence": 0.85

}

},

...more transactions...

\]

}

## 10.7 Adjustment Endpoints

POST /api/v1/engagements/{qoe_id}/adjustments Create adjustment

GET /api/v1/engagements/{qoe_id}/adjustments List adjustments

Query: status=all|Draft|Pending|Approved|Rejected

source=all|AI_Detected|User_DrillDown|User_Upload

GET /api/v1/adjustments/{adjustment_id} Get adjustment

PUT /api/v1/adjustments/{adjustment_id} Update adjustment

POST /api/v1/adjustments/{adjustment_id}/approve Approve

POST /api/v1/adjustments/{adjustment_id}/reject Reject

DELETE /api/v1/adjustments/{adjustment_id} Delete

## 10.8 Import/Export Endpoints

GET /api/v1/templates/adjustment Download Excel template

POST /api/v1/engagements/{qoe_id}/import Import from Excel

## 10.9 EBITDA Bridge Endpoint

GET /api/v1/engagements/{qoe_id}/ebitda-bridge

Query params:

period_type: "YTD" | "TTM" | "Annual" | "Monthly"

as_of_period: "2023-12" (optional)

Response: (see Section 7.10 for EBITDABridge data model)

## 10.10 Report & Audit Endpoints

GET /api/v1/engagements/{qoe_id}/report Generate/download report

GET /api/v1/engagements/{qoe_id}/audit Get audit log

Query: action=upload|mapping|adjustment|approval

from=2023-01-01 to=2023-12-31

# 11\. BUILD PHASES

The platform is built in four phases. Each phase delivers a working, testable system. No phase has a time estimate; work until the phase is complete and all tests pass before moving to the next.

**Important:** There are no deadlines on any phase. Focus on quality and completeness. Each phase ends with a thorough testing checkpoint where users validate the build before the next phase begins.

## 11.1 PHASE 1: Core Foundation

**Goal:** A working Income Statement tab with GL drill-down, anomaly detection, one-click addback creation, approval workflow, and EBITDA Bridge. This is the minimum viable product.

### 11.1.1 Phase 1 Scope — What to Build

| **Component** | **Details** |
| --- | --- |
| File Upload System | Upload endpoint for Monthly P&L, GL Detail (XLSX/CSV). Store files, track parse status. |
| P&L Parser | Parse uploaded Monthly P&L files. Detect headers, line items, multiple periods. Store in MonthlyPL/PLLineItem tables. |
| GL Parser | Parse uploaded GL Detail files. Detect columns (date, account, description, debit, credit). Store in GLDetail/GLEntry tables. Validate debits = credits. |
| Account Mapping | Extract unique GL accounts. Show mapping UI (list of accounts with AI-suggested categories). Store confirmed mappings. Link GL entries to P&L line items. |
| Income Statement Tab | Display monthly P&L grid from uploaded data. All periods as columns. YTD/TTM calculated columns. Every cell is clickable. |
| Anomaly Detection | Run variance algorithm (Section 5.3) on all P&L line items. Flag items exceeding thresholds. Store anomaly data. Highlight cells in UI. |
| Drill-Down Panel | Click any P&L cell to open slide-out panel. Show GL transactions sorted by amount. Show AI analysis for flagged items. |
| AI Integration (Anomaly Analysis Agent) | Call Claude API for flagged items. Generate summary, detailed analysis, driver identification, addback recommendation. Display in drill-down panel. |
| AI Integration (Account Mapping Agent) | Call Claude API when mapping GL accounts. Generate top-3 suggestions with confidence scores. Display in mapping UI. |
| AI Integration (Addback Detection Agent) | After mapping is complete, scan GL for common addback patterns (owner comp, one-time items, related party). Create Draft adjustments for detected items. |
| One-Click Addback | Checkbox selection on drill-down transactions. Add as Adjustment button. Pre-populated modal with AI suggestions. Create Draft adjustment record. |
| Approval Workflow | Adjustments tab with list of all adjustments. Approve/Reject/Modify actions. Status tracking. Audit logging. |
| EBITDA Bridge | Auto-compute from approved adjustments. Display bridge view (Reported EBITDA + Adjustments = Adjusted EBITDA). Update when adjustments change. |
| Data Sources Tab | List all uploaded files. Show parse status, validation status, error messages. Allow re-upload. |
| Basic Validation | Completeness check, GL balance check, P&L-to-GL tie. Run on upload. Show results in Data Sources tab. |
| Audit Trail | Log all uploads, mapping changes, adjustment actions, approvals. Append-only. |

### 11.1.2 Phase 1 Scope — What NOT to Build Yet

| **Excluded** | **Why** |
| --- | --- |
| Balance Sheet tab | Phase 2. P&L is higher priority for QoE analysis. |
| Multi-entity / Consolidation | Phase 3. Start with single entity to get core working. |
| Intercompany elimination | Phase 3. Requires multi-entity. |
| Cash / Accrual toggle | Phase 2. Requires bank statement and AR/AP data. |
| Bank statement parsing | Phase 2. Not needed for core P&L analysis. |
| Revenue analysis tab | Phase 3. Advanced analysis after core is solid. |
| Working capital analysis | Phase 4. Requires Balance Sheet data. |
| Report generation (PDF/Word) | Phase 4. Users can work with the EBITDA Bridge directly in Phase 1. |
| Excel adjustment import | Phase 2. One-click from drill-down is enough for Phase 1. |
| Version control for reports | Phase 4. |

### 11.1.3 Phase 1 Build Sequence

Build these components in order. Each step depends on the previous one. Checkpoints marked with \[TEST\] are where you should pause and verify everything works before moving on.

| **Step** | **What to Build** | **Depends On** | **Checkpoint** |
| --- | --- | --- | --- |
| 1   | Project Setup: Initialize FastAPI backend, React frontend, PostgreSQL database, project structure, env config. | Nothing | \[TEST\] Both projects run locally, DB connects |
| 2   | Database Schema: Create all Phase 1 tables (see Data Models), set up Alembic migrations, create seed data. | Step 1 | \[TEST\] Migrations run, seed data populates |
| 3   | File Upload & Storage: POST endpoint for file upload, S3/local storage, metadata tracking. | Step 2 | \[TEST\] Can upload a file, see it in DB |
| 4   | P&L Parser: Parse Monthly P&L from XLSX/CSV, detect headers, store in MonthlyPL/PLLineItem. | Step 3 | \[TEST\] Upload P&L file, verify data in DB |
| 5   | GL Parser: Parse GL Detail from XLSX/CSV, detect columns, store in GLDetail/GLEntry, validate balance. | Step 3 | \[TEST\] Upload GL file, verify data in DB, balanced |
| 6   | Account Mapping: Extract unique accounts, AI suggestions (Claude API), mapping UI, store mappings, link GL to P&L. | Steps 4, 5 | \[TEST\] All accounts mapped, GL entries linked to P&L lines |
| 7   | Income Statement Tab: Display monthly P&L grid, all periods as columns, YTD/TTM, proper formatting. | Steps 4, 6 | \[TEST\] P&L displays correctly in browser |
| 8   | Anomaly Detection: Run variance algorithm on P&L, flag items, store anomaly data, color-code cells. | Step 7 | \[TEST\] Unusual items highlighted in P&L grid |
| 9   | Drill-Down Panel: Click handler, query GL transactions, display in slide-out panel, sort by amount. | Steps 6, 7 | \[TEST\] Click number, see underlying transactions |
| 10  | AI Anomaly Analysis: Claude API integration for flagged items, generate analysis, show in drill-down. | Steps 8, 9 | \[TEST\] AI analysis appears for flagged items |
| 11  | Addback Detection Agent: Scan GL for common addback patterns, create Draft adjustments. | Steps 6, 10 | \[TEST\] AI-detected adjustments appear in queue |
| 12  | One-Click Addback: Checkboxes in drill-down, Add as Adjustment button, pre-populated modal, create Draft. | Steps 9, 10 | \[TEST\] Select transaction, click Add, adjustment created |
| 13  | Approval Workflow: Adjustments tab, list all adjustments, Approve/Reject/Modify, status tracking, audit. | Steps 11, 12 | \[TEST\] Full approval lifecycle works |
| 14  | EBITDA Bridge: Compute from approved adjustments, display bridge view, auto-update on changes. | Step 13 | \[TEST\] Bridge shows correct Adjusted EBITDA |
| 15  | Data Sources Tab: List files, parse status, validation results, re-upload option. | Steps 3, 4, 5 | \[TEST\] User can see all uploaded files and their status |
| 16  | Polish & Error Handling: Error states, loading indicators, navigation, responsive layout, edge cases. | All above | \[TEST\] Phase 1 complete, comprehensive testing |

### 11.1.4 Phase 1 Testing Checklist

| **Test Scenario** | **Expected Result** | **Pass?** |
| --- | --- | --- |
| Upload a Monthly P&L (XLSX) | File parsed correctly, line items appear in Income Statement tab |     |
| Upload a GL Detail (XLSX) | File parsed correctly, entries stored, debits = credits |     |
| Map all GL accounts | All accounts have confirmed mappings, GL entries linked to P&L lines |     |
| View Income Statement tab | All months display, totals correct, formatting clean |     |
| See anomaly highlights | Unusual amounts have red/yellow background |     |
| Click on a flagged number | Drill-down opens, shows transactions and AI analysis |     |
| Select transaction and add as adjustment | Modal appears pre-populated, adjustment created as Draft |     |
| Approve adjustment | Status changes, adjustment appears in EBITDA Bridge |     |
| Reject adjustment | Requires reason, status changes, does NOT appear in bridge |     |
| View EBITDA Bridge | Correct Reported EBITDA, all approved adjustments listed, correct Adjusted EBITDA |     |
| Check audit log | All uploads, mappings, approvals recorded with timestamps |     |
| Upload GL with unbalanced debits/credits | Validation error shown, blocks processing |     |
| Upload malformed file (wrong columns) | Parser error shown with helpful message |     |

### 11.1.5 Phase 1 User Flows

These are the key workflows a user follows in Phase 1. Build the UI to support these flows smoothly.

FLOW 1: Initial Setup

1\. User creates new engagement (name, periods, industry)

2\. User uploads Monthly P&L file (XLSX or CSV)

3\. System validates and parses the file

4\. If validation fails: show errors, user fixes and re-uploads

5\. If validation passes: Income Statement tab populates

6\. User uploads GL Detail file

7\. System validates GL (debits = credits)

8\. System extracts unique GL accounts

FLOW 2: Account Mapping

1\. System displays list of unique accounts from GL

2\. For each account, AI suggests top 3 category mappings

3\. User accepts suggestion OR manually selects category

4\. System flags unmapped accounts in red

5\. User must map all accounts before drill-down works

6\. Once complete, GL entries are linked to P&L lines

FLOW 3: Review & Adjust

1\. User views Income Statement tab with anomaly highlights

2\. User clicks on a flagged number (red/yellow cell)

3\. Drill-down panel opens with GL transactions and AI analysis

4\. User reads AI analysis, reviews transactions

5\. User checks transactions to adjust, clicks Add as Adjustment

6\. Modal appears with AI-suggested category and rationale

7\. User confirms or edits, clicks Create as Draft

8\. Adjustment appears in Adjustments tab

FLOW 4: Approval & Bridge

1\. User (or reviewer) opens Adjustments tab

2\. Sees all Draft/Pending adjustments with details

3\. Clicks Approve (accepts as-is) or Modify (changes amount)

4\. For Reject: must provide reason

5\. Approved adjustments flow into EBITDA Bridge

6\. Bridge auto-updates, showing Adjusted EBITDA

## 11.2 PHASE 2: Balance Sheet & Dynamic Views

**Goal:** Add Balance Sheet tab, Cash/Accrual toggle, bank statement support, multi-source comparison, and Excel adjustment import.

### 11.2.1 Phase 2 Scope

| **Component** | **Details** |
| --- | --- |
| Balance Sheet Tab | Same drill-down functionality as Income Statement. Monthly BS snapshots with GL linkage. Working capital auto-calculation. |
| Monthly BS Parser | Parse uploaded Balance Sheet files. Same approach as P&L parser but for BS categories. |
| Cash/Accrual Toggle | Toggle between accrual and cash basis views. Cash view derived by reversing accruals using AR/AP data. |
| Bank Statement Parser (CSV) | Parse bank statement CSVs. Match bank transactions to GL entries (auto-match + manual matching). |
| Trial Balance Upload | Parse TB files. Cross-validate against GL totals. |
| GL-Derived vs Uploaded Comparison | Side-by-side view showing uploaded P&L/BS vs GL-derived amounts. Flag material variances. |
| Excel Adjustment Import | Download template, fill in Excel, upload. System validates and imports as Draft adjustments. |
| AR/AP Aging Upload | Parse aging reports. Feed into cash conversion calculation. |
| Validation Agent Enhancement | Add cross-source validation: GL vs TB, GL vs Bank, GL vs uploaded P&L. |

### 11.2.2 Phase 2 New Data Models

Add these data models to the database schema:

| **Model** | **Purpose** |
| --- | --- |
| MonthlyBS / BSLineItem | Balance Sheet data with same linkage/anomaly structure as P&L (defined in Section 7.4) |
| BankStatement / BankTransaction | Bank data with GL matching (defined in Section 7.6) |
| SourceReconciliation | Cross-source variance tracking (defined in Section 7.11) |

## 11.3 PHASE 3: Multi-Entity & Advanced Analysis

**Goal:** Add multi-entity support, consolidation with IC elimination, and advanced analysis tabs (Revenue, COGS, Expense, Trend).

### 11.3.1 Phase 3 Scope

| **Component** | **Details** |
| --- | --- |
| Multi-Entity Support | Multiple entities per engagement. Separate P&L, BS, GL per entity. Entity selector in view controls. |
| Consolidation | Sum all (or selected) entities. Consolidated view with entity breakdown available. |
| Intercompany Elimination | Flag IC accounts/transactions. Toggle to eliminate IC from consolidated view. IC mapping table. |
| Revenue Analysis Tab | Top customers, concentration analysis, revenue quality (recurring vs one-time), MoM/YoY trends, revenue bridge. |
| COGS Analysis Tab | Cost breakdown by category. Margin analysis. Cost trends. Material cost vs labor cost split. |
| Expense Analysis Tab | Operating expense trends. Run-rate analysis. Discretionary vs non-discretionary split. |
| Trend Analysis Tab | MoM and YoY bridges. Seasonality detection. Trend lines. Forecast projections. |
| Revenue Analysis Agent Integration | AI-powered revenue quality narrative and risk assessment. |

### 11.3.2 Phase 3 New Data Models

Add: IntercompanyMapping, ClientProvidedFS, RevenueAnalysis, CustomerConcentration (see Section 7.11).

## 11.4 PHASE 4: Reporting & Polish

**Goal:** Full QoE report generation, working capital analysis, sensitivity analysis, RBAC, and production hardening.

### 11.4.1 Phase 4 Scope

| **Component** | **Details** |
| --- | --- |
| Working Capital Tab | NWC schedule, DSO/DPO/DIO metrics, peg recommendation, seasonal NWC analysis. |
| Working Capital Agent Integration | AI-powered NWC analysis and peg recommendation narrative. |
| Report Generation | Generate full QoE report (PDF and Word). Executive summary, revenue analysis, EBITDA bridge, adjustment schedule, working capital, appendices. |
| Report Version Control | Track all report versions. Show changes between versions. Allow rollback. |
| Report Generation Agent | AI-powered narrative generation for report sections. |
| Sensitivity Analysis | EBITDA scenarios: best case, worst case, base case based on including/excluding specific adjustments. |
| Role-Based Access Control | Implement RBAC as defined in Section 9.1. Authentication, authorization, role management. |
| Reproducibility Pack | Export entire engagement as a self-contained package: data, mappings, adjustments, reports, audit trail. |
| Industry Templates | Pre-configured account mappings for common industries (Construction, SaaS, Manufacturing, Healthcare). |
| Historical Learning | Improve AI suggestions based on past approved/rejected adjustments across engagements. |
| API Access | External API for integration with other systems. API key management. |

# APPENDIX A: Standard Adjustment Categories

These are the valid categories for adjustments. This list is used for validation, AI suggestions, and reporting.

| **Category** | **Description (for developers)** | **Common Examples** |
| --- | --- | --- |
| Owner Compensation | Owner/executive pay that exceeds what a market-rate replacement would cost. The excess is added back because a buyer would pay market rate. | CEO salary $400K, market rate $200K. Addback = $200K. |
| One-Time — Legal | Legal expenses that are clearly non-recurring. Lawsuits, settlements, one-time legal projects. | Employment lawsuit settlement $85K. |
| One-Time — Professional | Non-recurring professional fees. M&A advisory, one-time consulting projects. | Sell-side advisory fee $150K. |
| One-Time — Other | Any other non-recurring expense. | Office move costs, restructuring charges. |
| Related Party | Transactions between the company and entities related to the owner. Often above market rate. | Rent paid to owner’s LLC at $8K/mo, market rate $5K/mo. Addback = $36K/yr. |
| Non-Recurring Revenue | Revenue that will not repeat. Subtracted (reduces EBITDA). | Insurance settlement income, COVID grant. |
| Non-Cash | Expenses that do not involve cash leaving the business. | Stock-based compensation, depreciation of written-up assets. |
| COVID-Related | Pandemic-specific items that should not be considered part of normal operations. | PPP loan forgiveness income, COVID testing costs. |
| Discretionary | Expenses at the owner’s personal discretion, not necessary for operations. | Country club membership, luxury vehicle lease. |
| Pro Forma Adjustment | Adjustments for things that are changing. A known future state. | New contract starting next month, facility closing. |
| Run-Rate Adjustment | Annualizing a partial-year expense to show full impact. | New hire started in July, annualize salary for full year. |
| Reclassification | Moving an item from one line to another without changing total EBITDA. | Move delivery costs from OpEx to COGS for consistency. |

# APPENDIX B: Standard P&L and BS Categories

## B.1 Standard P&L Categories

| **Code** | **Category Name** | **Type** | **Typical GL Accounts** |
| --- | --- | --- | --- |
| REV | Revenue | Income | 4000-4999 |
| COGS | Cost of Goods Sold | Expense | 5000-5999 |
| OPEX-PAY | Payroll & Benefits | OpEx | 6000-6099 |
| OPEX-RENT | Rent & Occupancy | OpEx | 6100-6199 |
| OPEX-PRO | Professional Services | OpEx | 6200-6299 |
| OPEX-MKT | Marketing & Sales | OpEx | 6300-6399 |
| OPEX-INS | Insurance | OpEx | 6400-6499 |
| OPEX-UTIL | Utilities | OpEx | 6500-6599 |
| OPEX-OTH | Other Operating Expenses | OpEx | 6600-6999 |
| DA  | Depreciation & Amortization | Non-Cash | 7000-7099 |
| INT | Interest Income/Expense | Below EBITDA | 7100-7199 |
| OI  | Other Income | Below EBITDA | 7200-7299 |
| OE  | Other Expense | Below EBITDA | 7300-7399 |
| TAX | Income Tax | Below EBITDA | 8000-8999 |

## B.2 Standard BS Categories

| **Code** | **Category Name** | **Section** |
| --- | --- | --- |
| CA-CASH | Cash & Equivalents | Current Assets |
| CA-AR | Accounts Receivable | Current Assets |
| CA-INV | Inventory | Current Assets |
| CA-PRE | Prepaid Expenses | Current Assets |
| CA-OTH | Other Current Assets | Current Assets |
| NCA-PPE | Property & Equipment | Non-Current Assets |
| NCA-INT | Intangible Assets | Non-Current Assets |
| NCA-OTH | Other Non-Current Assets | Non-Current Assets |
| CL-AP | Accounts Payable | Current Liabilities |
| CL-ACC | Accrued Expenses | Current Liabilities |
| CL-DEBT | Current Portion of Debt | Current Liabilities |
| CL-OTH | Other Current Liabilities | Current Liabilities |
| NCL-DEBT | Long-Term Debt | Non-Current Liabilities |
| NCL-OTH | Other Non-Current Liabilities | Non-Current Liabilities |
| EQ-STOCK | Common Stock / Paid-in Capital | Equity |
| EQ-RE | Retained Earnings | Equity |
| EQ-OTH | Other Equity | Equity |

# APPENDIX C: File Format Specifications

## C.1 Monthly P&L Expected Format

Expected layout: Rows = line items, Columns = periods

+-------------------------+----------+----------+----------+-----+

| Account | Jan 2023 | Feb 2023 | Mar 2023 | ... |

+-------------------------+----------+----------+----------+-----+

| Revenue | | | | |

| Product Sales | 100,000 | 105,000 | 110,000 | |

| Service Revenue | 50,000 | 52,000 | 55,000 | |

| Total Revenue | 150,000 | 157,000 | 165,000 | |

| | | | | |

| Cost of Goods Sold | | | | |

| Materials | 40,000 | 42,000 | 44,000 | |

| ... | | | | |

+-------------------------+----------+----------+----------+-----+

Parser requirements:

\- Detect header row (contains month names or dates)

\- Handle various date formats (Jan 2023, 1/2023, 2023-01)

\- Preserve hierarchy (indent detection for subtotals)

\- Handle blank rows as section separators

\- Convert negative numbers (parentheses or minus sign)

\- Handle mixed formatting within cells

## C.2 GL Detail Expected Format

Required columns: Date, Account Code, Account Name, Description, Debit, Credit

Optional columns: Reference, Memo, Vendor/Customer, Department, Class, Location

+------------+------+------------------+------------------------+--------+--------+

| Date | Acct | Account Name | Description | Debit | Credit |

+------------+------+------------------+------------------------+--------+--------+

| 2023-03-01 | 1000 | Cash - Operating | Deposit - Customer ABC | | 15,000 |

| 2023-03-01 | 1200 | Accounts Recv | Invoice #1234 | 15,000 | |

| 2023-03-05 | 6100 | Professional Fee | Legal - Smith & Assoc | 35,000 | |

| ... | | | | | |

+------------+------+------------------+------------------------+--------+--------+

Parser requirements:

\- Detect header row automatically

\- Handle flexible column names (Date/Trans Date/Transaction Date)

\- Calculate net amount (Debit - Credit)

\- Validate: Total Debits = Total Credits

\- Handle multiple date formats (MM/DD/YYYY, YYYY-MM-DD, etc.)

\- Handle blank debit/credit cells (treat as 0)

# APPENDIX D: Glossary

Quick reference for terms used throughout this document, written for developers who are not accountants.

| **Term** | **Definition** |
| --- | --- |
| Addback | An adjustment that increases EBITDA. Most QoE adjustments are addbacks (adding back expenses that are not part of normal operations). |
| Adjusted EBITDA | EBITDA after applying all approved adjustments. This is the number buyers use to value the business. |
| EBITDA | Earnings Before Interest, Taxes, Depreciation, and Amortization. A proxy for cash earnings from operations. |
| EBITDA Bridge | A structured walkthrough: Reported Net Income + I + T + D + A = Reported EBITDA + Adjustments = Adjusted EBITDA. |
| Engagement | A single QoE analysis project. One engagement per deal. |
| GL (General Ledger) | The complete transaction log of every financial event. The most granular financial data. |
| Intercompany (IC) | Transactions between related entities within the same corporate group. Must be eliminated in consolidation. |
| M&A | Mergers & Acquisitions. The buying and selling of companies. |
| NWC (Net Working Capital) | Current Assets minus Current Liabilities, excluding cash and debt. Capital needed to run day-to-day operations. |
| P&L / Income Statement | Revenue minus Expenses = Profit. Shows performance over a period. |
| Peg | The agreed-upon target level of working capital in an M&A deal. |
| QoE | Quality of Earnings. The analysis this platform automates. |
| Reported | Numbers as they appear in the company's books before any adjustments. |
| TB (Trial Balance) | Summary of all GL accounts with Debit and Credit totals. Used for validation. |
| TTM / LTM | Trailing Twelve Months / Last Twelve Months. The most recent 12 months of financial data. |