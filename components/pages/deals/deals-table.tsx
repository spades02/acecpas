"use client"

import { useState, useEffect, useRef } from "react"; // Added hooks
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FolderOpen, MoreVertical, ChevronLeft, ChevronRight, Calendar, User, Search, Filter } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Deal } from "@/data/deals-data";

// ... existing interface ...
interface DealsTableProps {
  data: Deal[];
  emptyMessage?: string;
  totalItems: number; 
  itemsPerPage?: number;
  currentPage: number;
  viewMode?: "home" | "detailed"; 
}

export function DealsTable({ 
  data, 
  emptyMessage = "No deals found",
  totalItems, 
  itemsPerPage = 3,
  currentPage,
  viewMode = "detailed"
}: DealsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isHome = viewMode === "home";

  const isMounted = useRef(false);

  // --- SEARCH & FILTER LOGIC ---
  
  // 1. Debounce Logic: We don't want to reload the page on every keystroke
  const [searchTerm, setSearchTerm] = useState(searchParams.get("query")?.toString() || "");

  // Update URL when search changes (with 300ms delay)
  useEffect(() => {
    // If this is the FIRST render (e.g. hitting Back Button), do nothing.
    if (!isMounted.current) {
      isMounted.current = true;
      return; 
    }

    const timer = setTimeout(() => {
        const params = new URLSearchParams(searchParams);
        
        // Only update if the value is actually different from URL to avoid redundant pushes
        const currentQuery = params.get("query") || "";
        if (searchTerm === currentQuery) return;

        if (searchTerm) {
            params.set("query", searchTerm);
        } else {
            params.delete("query");
        }
        
        // This is the line that was causing the bug. 
        // Now it only runs if isMounted is true (user is actually typing)
        params.set("page", "1"); 
        
        router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]); // Removed dependencies that cause loops, kept searchTerm

  // 2. Filter Logic (Immediate update)
  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status && status !== "all") {
        params.set("status", status); // Assumes your DB loader looks for 'status'
    } else {
        params.delete("status");
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  // ... (keep createPageURL, handlePageChange, handleRowClick, getStatusBadge helper functions) ...
  // Note: Ensure handlePageChange uses the *current* params so it doesn't clear search/filters
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams); // Get ALL current params (search, filter, etc)
    params.set("page", newPage.toString());         // Update only page
    router.push(`${pathname}?${params.toString()}`);
  };
  const handleRowClick = (dealId: string) => {
    router.push(`/deals/${dealId}`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
       'mapping': { label: 'Mapping', className: 'bg-amber-100 text-amber-800 border-amber-200' },
       'complete': { label: 'Complete', className: 'bg-green-100 text-green-800 border-green-200' },
       'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-800 border-blue-200' },
       'upload': { label: 'Upload Phase', className: 'bg-purple-100 text-purple-800 border-purple-200' },
       'open-items': { label: 'Open Items', className: 'bg-orange-100 text-orange-800 border-orange-200' },
    };
    const variant = variants[status] || variants['in-progress'];
    return <Badge className={variant.className} variant="outline">{variant.label}</Badge>;
  };
  
  // ... (keep pagination math: startItem, endItem, totalPages) ...
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
      <div className="space-y-4"> 
        
        {/* --- 1. SEARCH & FILTER TOOLBAR (Detailed View Only) --- */}
        {!isHome && (
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search deals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex items-center gap-2">
                     <Select 
                        defaultValue={searchParams.get("status") || "all"} 
                        onValueChange={handleStatusFilter}
                     >
                        <SelectTrigger className="w-[180px]">
                            <Filter className="w-4 h-4 mr-2 text-muted-foreground"/>
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            {/* Add your specific statuses here */}
                        </SelectContent>
                     </Select>
                     
                     {/* Clear Filters Button (Optional) */}
                     {(searchParams.get("status") || searchParams.get("query")) && (
                        <Button 
                            variant="ghost" 
                            onClick={() => {
                                setSearchTerm("");
                                router.push(pathname); // Clears all params
                            }}
                        >
                            Reset
                        </Button>
                     )}
                </div>
            </div>
        )}

        {/* --- 2. THE TABLE (Wrapped in border div) --- */}
        <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
             <TableRow className="bg-muted/50 hover:bg-muted/50">
               {/* 1. Common Columns */}
               <TableHead className="px-6 py-3">Deal Name</TableHead>
               <TableHead className="px-6 py-3">Client</TableHead>

               {/* 2. Detailed View Only Columns */}
               {!isHome && (
                 <>
                   <TableHead className="px-6 py-3">Type</TableHead>
                   <TableHead className="px-6 py-3">Industry</TableHead>
                 </>
               )}

               {/* 3. Common Columns */}
               <TableHead className="px-6 py-3">Status</TableHead>
               <TableHead className="px-6 py-3">Progress</TableHead>

               {/* 4. Conditional Columns: Assigned/Target (Detailed) vs Last Updated (Home) */}
               {!isHome ? (
                 <>
                   <TableHead className="px-6 py-3">Assigned To</TableHead>
                   <TableHead className="px-6 py-3">Target Close</TableHead>
                 </>
               ) : (
                 <TableHead className="px-6 py-3">Last Updated</TableHead>
               )}

               <TableHead className="px-6 py-3">Actions</TableHead>
             </TableRow>
          </TableHeader>
          <TableBody>
             {data.length === 0 ? (
              <TableRow>
                {/* Adjust colSpan dynamically based on visible columns */}
                <TableCell colSpan={isHome ? 6 : 9} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((deal) => (
                <TableRow 
                  key={deal.id} 
                  className="cursor-pointer hover:bg-muted/50 group"
                  onClick={() => handleRowClick(deal.id)}
                >
                   {/* Deal Name */}
                   <TableCell className="px-6 py-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FolderOpen className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm">{deal.name}</span>
                    </div>
                  </TableCell>

                  {/* Client */}
                  <TableCell className="px-6 py-4 text-sm">{deal.client}</TableCell>

                  {/* Type & Industry (Detailed Only) */}
                  {!isHome && (
                    <>
                       <TableCell className="px-6 py-4 text-sm text-muted-foreground">{deal.type || '-'}</TableCell>
                       <TableCell className="px-6 py-4 text-sm text-muted-foreground">{deal.industry || '-'}</TableCell>
                    </>
                  )}

                  {/* Status */}
                  <TableCell className="px-6 py-4">{getStatusBadge(deal.status)}</TableCell>

                  {/* Progress */}
                  <TableCell className="px-6 py-4 w-[100px]">
                    <div className="flex items-center gap-3">
                      <Progress value={deal.progress} className="h-2" />
                      <span className="text-xs font-medium text-muted-foreground">{deal.progress}%</span>
                    </div>
                  </TableCell>

                  {/* Assigned/Target (Detailed) vs Last Updated (Home) */}
                  {!isHome ? (
                    <>
                      <TableCell className="px-6 py-4 text-sm">
                         {/* Example for Assigned To - assuming it's a string or object */}
                         <div className="flex items-center gap-2">
                             <User className="h-3 w-3 text-muted-foreground" />
                             <span>{deal.assignedTo || 'Unassigned'}</span>
                         </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{deal.targetClose ? new Date(deal.targetClose).toLocaleDateString() : '-'}</span>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <TableCell className="px-6 py-4 text-sm text-muted-foreground">
                      {deal.lastUpdated ? new Date(deal.lastUpdated).toLocaleDateString() : 'Just now'}
                    </TableCell>
                  )}

                  {/* Actions */}
                  <TableCell className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleRowClick(deal.id); }}>Open Deal</DropdownMenuItem>
                         <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Edit Details</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          
          {totalItems > 0 && (
            <TableFooter className="bg-transparent border-t">
               <TableRow>
                 {/* Adjust colSpan here as well */}
                 <TableCell colSpan={isHome ? 6 : 9}>
                    <div className="flex items-center justify-between px-2 w-full">
                       <div className="text-sm text-muted-foreground">
                          Showing {startItem}-{endItem} of {totalItems} deals
                       </div>
                       <div className="flex items-center space-x-2">
                          <Button
                             variant="outline"
                             size="sm"
                             onClick={(e) => { 
                                 e.stopPropagation(); 
                                 handlePageChange(currentPage - 1); 
                             }}
                             disabled={currentPage <= 1}
                          >
                             <ChevronLeft className="h-4 w-4 mr-1" />
                             Previous
                          </Button>
                          <Button
                             variant="outline"
                             size="sm"
                             onClick={(e) => { 
                                 e.stopPropagation(); 
                                 handlePageChange(currentPage + 1); 
                             }}
                             disabled={currentPage >= totalPages}
                          >
                             Next
                             <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                       </div>
                    </div>
                 </TableCell>
               </TableRow>
            </TableFooter>
          )}

        </Table>
        </div>
      </div>
  );
}