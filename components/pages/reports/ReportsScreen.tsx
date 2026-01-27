import { FileText, FileSpreadsheet, Download, Share2, CheckCircle, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_REPORT_DATA, ReportData } from "@/data/reports-data"; // Import from Part 1
import { BackButton } from "@/components/ui/back-button";

interface ReportsScreenProps {
  onNavigate: (page: string) => void;
  data?: ReportData; // Optional prop, defaults to MOCK_DATA
}

const formatCurrency = (value: number | null) => {
  if (value === null) return "—";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export function ReportsScreen({ onNavigate, data = MOCK_REPORT_DATA }: ReportsScreenProps) {

  return (
    <div className="p-6 space-y-6">
      <BackButton />
      {/* Completion Banner */}
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-start gap-4">
          <CheckCircle className="w-12 h-12 text-green-600" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-green-800 mb-2">Deal Complete! 🎉</h2>
            <p className="text-green-700 mb-4">
              All files processed, accounts mapped, and open items resolved
            </p>
            <div className="flex items-center gap-8 text-sm font-medium text-green-800 flex-wrap">
              <div className="flex items-center gap-2">
                ⏱ Completed in {data.processing.duration}
              </div>
              <div className="flex items-center gap-2">
                📊 {data.processing.accountsMapped.toLocaleString()} accounts mapped
              </div>
              <div className="flex items-center gap-2">
                ✓ {data.processing.openItemsCount} open items generated
              </div>
              <div className="flex items-center gap-2">
                💡 ~{data.processing.hoursSaved} manual hours saved
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{data.metadata.dealName} - Final Reports</h1>
        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
          <span>Date Range: {data.metadata.dateRange}</span>
          <span>•</span>
          <Badge className="bg-green-100 text-green-800 border-green-200">{data.metadata.status}</Badge>
          <span>•</span>
          <span>Generated: Today at 2:45 PM by {data.metadata.author}</span>
        </div>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="excel" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="excel">📊 Excel Databook</TabsTrigger>
          <TabsTrigger value="pdf">📄 PDF Summary</TabsTrigger>
          <TabsTrigger value="items">📝 Open Items</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Preview Area */}
          <div>
            {/* Excel Databook Tab */}
            <TabsContent value="excel" className="mt-0">
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-2">Excel Databook Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    Professional Excel workbook with {data.excel.summary.worksheets} worksheets including Trial Balance, Income Statement, EBITDA Summary, and more
                  </p>
                </div>

                {/* Excel Preview */}
                <div className="bg-muted rounded-lg p-6 border space-y-6">
                  {/* Worksheet View */}
                  <div className="bg-white rounded shadow-sm overflow-hidden">
                    <div className="bg-gray-100 border-b flex gap-2 p-2 text-xs overflow-x-auto">
                      {['Trial Balance', 'Income Statement', 'Balance Sheet', 'EBITDA', 'Cash Flow'].map((sheet, i) => (
                        <div key={sheet} className={`px-3 py-1 rounded cursor-pointer whitespace-nowrap ${i === 0 ? 'bg-white font-medium shadow-sm' : 'text-muted-foreground hover:bg-white/50'}`}>
                          {sheet}
                        </div>
                      ))}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-primary text-primary-foreground">
                          <tr>
                            <th className="text-left px-3 py-2 font-semibold border border-primary/20">Account #</th>
                            <th className="text-left px-3 py-2 font-semibold border border-primary/20">Account Name</th>
                            <th className="text-left px-3 py-2 font-semibold border border-primary/20">Category</th>
                            <th className="text-right px-3 py-2 font-semibold border border-primary/20">Debit</th>
                            <th className="text-right px-3 py-2 font-semibold border border-primary/20">Credit</th>
                            <th className="text-right px-3 py-2 font-semibold border border-primary/20">Balance</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.excel.trialBalance.sections.map((section, idx) => (
                            <>
                              {/* Section Header */}
                              <tr key={`header-${idx}`} className="bg-gray-100 font-semibold">
                                <td className="px-3 py-2 border" colSpan={6}>{section.title}</td>
                              </tr>

                              {/* Rows */}
                              {section.rows.map((row) => (
                                <tr key={row.accountNum} className="hover:bg-blue-50">
                                  <td className="px-3 py-1.5 border">{row.accountNum}</td>
                                  <td className="px-3 py-1.5 border">{row.name}</td>
                                  <td className="px-3 py-1.5 border text-xs text-muted-foreground">{row.category}</td>
                                  <td className="px-3 py-1.5 border text-right">{formatCurrency(row.debit)}</td>
                                  <td className="px-3 py-1.5 border text-right text-muted-foreground">{formatCurrency(row.credit)}</td>
                                  <td className={`px-3 py-1.5 border text-right font-medium ${section.isRevenue ? 'text-green-700' : ''}`}>
                                    {section.isRevenue && row.balance < 0 ? `(${formatCurrency(Math.abs(row.balance))})` : formatCurrency(row.balance)}
                                  </td>
                                </tr>
                              ))}

                              {/* Section Total */}
                              <tr key={`total-${idx}`} className={section.isRevenue ? "bg-blue-100 font-bold" : "bg-blue-100 font-bold"}>
                                <td className="px-3 py-2 border" colSpan={3}>{section.totalLabel}</td>
                                <td className="px-3 py-2 border text-right">{section.title === "REVENUE" ? "—" : formatCurrency(section.totalValue)}</td>
                                <td className="px-3 py-2 border text-right">{section.title === "REVENUE" ? formatCurrency(Math.abs(section.totalValue)) : "—"}</td>
                                <td className="px-3 py-2 border text-right">
                                  {section.isRevenue ? formatCurrency(Math.abs(section.totalValue)) : formatCurrency(section.totalValue)}
                                </td>
                              </tr>
                            </>
                          ))}

                          {/* Grand Total */}
                          <tr className="bg-primary/10 font-bold text-primary">
                            <td className="px-3 py-2 border" colSpan={3}>GRAND TOTAL</td>
                            <td className="px-3 py-2 border text-right">$8,247,560.00</td>
                            <td className="px-3 py-2 border text-right">$8,247,560.00</td>
                            <td className="px-3 py-2 border text-right">$0.00</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded border">
                      <div className="text-xs text-muted-foreground mb-1">Total Accounts</div>
                      <div className="text-2xl font-bold">{data.excel.summary.totalAccounts.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <div className="text-xs text-muted-foreground mb-1">Worksheets</div>
                      <div className="text-2xl font-bold">{data.excel.summary.worksheets}</div>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <div className="text-xs text-muted-foreground mb-1">Total Transactions</div>
                      <div className="text-2xl font-bold">{data.excel.summary.transactions.toLocaleString()}</div>
                    </div>
                    <div className="bg-white p-4 rounded border">
                      <div className="text-xs text-muted-foreground mb-1">Date Range</div>
                      <div className="text-sm font-bold">{data.excel.summary.durationLabel}</div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* PDF Summary Tab */}
            <TabsContent value="pdf" className="mt-0">
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-2">PDF Executive Summary</h3>
                  <p className="text-sm text-muted-foreground">
                    Comprehensive PDF report with executive summary, financial analysis, and key findings
                  </p>
                </div>

                <div className="bg-gray-100 rounded-lg p-8 border space-y-6">
                  {/* Cover Page */}
                  <div className="bg-white rounded shadow-lg p-12">
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 bg-primary rounded-2xl mx-auto flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-lg">
                        AC
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-foreground">AceCPAs</h2>
                        <p className="text-muted-foreground">Financial Intelligence Platform</p>
                      </div>
                      <div className="border-t border-b py-8 my-8">
                        <h1 className="text-4xl font-bold text-foreground mb-3">{data.metadata.dealName}</h1>
                        <p className="text-xl text-muted-foreground">Quality of Earnings Analysis</p>
                        <p className="text-sm text-muted-foreground mt-2">Executive Summary Report</p>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-2">
                        <div className="font-medium">Prepared for: {data.metadata.clientName}</div>
                        <div>Date: {data.metadata.generatedDate}</div>
                        <div>Engagement Period: {data.pdf.dealOverview.period}</div>
                        <div>Prepared by: {data.metadata.author}, CPA | KPMG LLP</div>
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary Page */}
                  <div className="bg-white rounded shadow-lg p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-6 pb-3 border-b">Executive Summary</h2>

                    <div className="space-y-6">
                      {/* Deal Overview */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          Deal Overview
                        </h3>
                        <div className="text-sm space-y-2 text-muted-foreground ml-8">
                          <p><strong>Target Company:</strong> {data.pdf.dealOverview.target}</p>
                          <p><strong>Industry:</strong> {data.pdf.dealOverview.industry}</p>
                          <p><strong>Transaction Type:</strong> {data.pdf.dealOverview.type}</p>
                          <p><strong>Deal Size:</strong> {data.pdf.dealOverview.size}</p>
                          <p><strong>Analysis Period:</strong> {data.pdf.dealOverview.period}</p>
                        </div>
                      </div>

                      {/* Financial Highlights */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                            <DollarSign className="w-4 h-4 text-green-600" />
                          </div>
                          Financial Highlights
                        </h3>
                        <div className="ml-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {data.pdf.highlights.map((highlight, index) => (
                            <div key={index} className={`p-3 rounded border bg-${highlight.colorTheme}-50 border-${highlight.colorTheme}-200`}>
                              <div className={`text-xs mb-1 text-${highlight.colorTheme}-700`}>{highlight.label}</div>
                              <div className={`text-xl font-bold text-${highlight.colorTheme}-800`}>{highlight.value}</div>
                              {highlight.subtext && (
                                <div className={`text-xs mt-1 flex items-center gap-1 text-${highlight.colorTheme}-600`}>
                                  {highlight.icon && <highlight.icon className="w-3 h-3" />}
                                  {highlight.subtext}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Key Findings */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <div className="w-6 h-6 bg-amber-100 rounded flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          </div>
                          Key Findings & Adjustments
                        </h3>
                        <div className="text-sm space-y-2 ml-8">
                          {data.pdf.findings.map((finding, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${finding.type === 'success' ? 'bg-green-100' : 'bg-amber-100'}`}>
                                {finding.type === 'success' ?
                                  <CheckCircle className="w-3 h-3 text-green-600" /> :
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                }
                              </div>
                              <p className="text-muted-foreground"><strong>{finding.title}:</strong> {finding.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Conclusion */}
                      <div>
                        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary/10 rounded flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-primary" />
                          </div>
                          Conclusion
                        </h3>
                        <div className="text-sm text-muted-foreground ml-8 space-y-2">
                          <p>{data.pdf.conclusion.text}</p>
                          <p className="font-medium text-foreground">{data.pdf.conclusion.boldText}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Open Items Tab */}
            <TabsContent value="items" className="mt-0">
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground mb-2">Open Items List</h3>
                  <p className="text-sm text-muted-foreground">
                    {data.processing.openItemsCount} items requiring client clarification - exported to separate worksheet
                  </p>
                </div>

                <div className="space-y-3">
                  {data.openItems.map((item) => (
                    <Card key={item.id} className={`p-4 border-l-4 ${item.priority === 'High' ? 'border-l-red-500' : item.priority === 'Medium' ? 'border-l-amber-500' : 'border-l-blue-500'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={
                              item.priority === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                                item.priority === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                  'bg-blue-100 text-blue-800 border-blue-200'
                            }>
                              {item.priority} Priority
                            </Badge>
                            <Badge variant="outline">{item.category}</Badge>
                          </div>
                          <div className="font-medium text-sm mb-1">Item #{item.id}: {item.description}</div>
                          <div className="text-xs text-muted-foreground">{item.subtext}</div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-bold text-lg">{formatCurrency(item.amount)}</div>
                          <div className="text-xs text-muted-foreground">{item.quarter}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </div>

          {/* Action Panel */}
          <div className="space-y-6">
            {/* Primary Download */}
            <Card className="p-6">
              <div className="text-center mb-4">
                <FileSpreadsheet className="w-12 h-12 text-primary mx-auto mb-3" />
                <Button className="w-full" size="lg">
                  <Download className="w-4 h-4 mr-2" />
                  Download Excel
                </Button>
              </div>

              <Card className="bg-muted p-3 text-sm space-y-1">
                <div className="font-medium">Complete Databook (.xlsx)</div>
                <div className="text-xs text-muted-foreground">File size: ~2.4 MB</div>
                <div className="text-xs text-muted-foreground">{data.excel.summary.worksheets} worksheets included</div>
                <div className="text-xs text-muted-foreground">Last updated: 2 mins ago</div>
              </Card>

              <Button variant="outline" className="w-full mt-3" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Download PDF Report
              </Button>
            </Card>

            {/* Sharing Options */}
            <Card className="p-6">
              <div className="text-xs font-medium text-muted-foreground uppercase mb-3">Share This Report</div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Email to Client
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  🔗 Generate Secure Link
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  ☁️ Save to Google Drive
                </Button>
              </div>
            </Card>

            {/* Metadata */}
            <Card className="p-6">
              <div className="text-xs font-medium text-muted-foreground uppercase mb-3">Report Details</div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div>Generated by: {data.metadata.author}</div>
                <div>Date: {data.metadata.generatedDate}</div>
                <div>Version: {data.metadata.version}</div>
                <div>Deal: {data.metadata.dealName}</div>
                <div>Status: <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">{data.metadata.status}</Badge></div>
              </div>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
export default ReportsScreen;