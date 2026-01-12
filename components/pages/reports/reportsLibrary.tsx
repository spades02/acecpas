import { useState } from "react";
import { Search, Filter, MoreVertical, FileText, Download, Clock, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust path as needed
import { Input } from "@/components/ui/input"; // Adjust path as needed
import { Badge } from "@/components/ui/badge"; // Adjust path as needed
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Adjust path as needed

import { MOCK_REPORTS_LIST, ReportSummary } from "@/data/reports-list-data";

interface ReportsLibraryProps {
  onSelectReport: (reportId: string) => void; // Callback to switch to the Detail View
}

export function ReportsLibrary({ onSelectReport }: ReportsLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Filter Logic
  const filteredReports = MOCK_REPORTS_LIST.filter(report => {
    const matchesSearch = report.dealName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          report.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || report.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ready for Export": return <Badge className="bg-green-100 text-green-800 border-green-200">Ready</Badge>;
      case "Draft": return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case "Processing": return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Processing</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Header & Controls */}
      <div className="md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Reports Archive</h1>
        <p className="text-muted-foreground">Access all historical reports and deliverables.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border">
        <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search deals, clients..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto">
            {['All', 'Ready for Export', 'Draft', 'Archived'].map((status) => (
                <Button 
                    key={status}
                    variant={filterStatus === status ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className="whitespace-nowrap"
                >
                    {status}
                </Button>
            ))}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredReports.map((report) => (
          <div key={report.id} className="group hover:shadow-md transition-all duration-200 cursor-pointer border rounded-xl" onClick={() => onSelectReport(report.id)}>
            
            {/* Card Header (Thumbnail style) */}
            <div className={`h-32 w-full bg-linear-to-br from-${report.thumbnailColor}-50 to-white border-b p-4 flex flex-col justify-between relative`}>
                <div className="flex justify-between items-start">
                     <div className={`rounded-lg bg-white shadow-sm text-${report.thumbnailColor}-600`}>
                        <FileText className="w-6 h-6" />
                     </div>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Rename</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                     </DropdownMenu>
                </div>
                <div className="font-mono text-xs text-muted-foreground bg-white/50 backdrop-blur self-start px-2 py-1 rounded">
                    {report.type}
                </div>
            </div>

            {/* Card Body */}
            <div className="p-4 space-y-4">
                <div>
                    <h3 className="font-semibold text-lg leading-none mb-1 group-hover:text-primary transition-colors">{report.dealName}</h3>
                    <p className="text-sm text-muted-foreground">{report.clientName}</p>
                </div>

                <div className="flex items-center justify-between text-sm">
                    {getStatusBadge(report.status)}
                    <span className="text-muted-foreground text-xs">{report.totalSize}</span>
                </div>

                <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 mr-2" />
                        Created {report.generatedDate}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5 mr-2" />
                        By {report.author}
                    </div>
                </div>
            </div>

            {/* Card Footer (Hover Action) */}
            <div className="p-3 bg-muted/30 border-t flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <Button className="w-full h-8 text-xs" variant="default">View Report</Button>
                 {report.status === 'Ready for Export' && (
                     <Button size="icon" className="h-8 w-8" variant="outline" title="Quick Download">
                         <Download className="w-3.5 h-3.5" />
                     </Button>
                 )}
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
          <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
            <div className="text-muted-foreground mb-2">
              No matching reports
              {searchTerm && <> for <span className="font-medium">"{searchTerm}"</span></>}
              {filterStatus && filterStatus !== "All" && <> in <span className="font-medium">{filterStatus}</span></>}
            </div>
            <Button variant="link" onClick={() => {setSearchTerm(""); setFilterStatus("All")}}>Clear filters</Button>
          </div>
      )}

    </div>
  );
}