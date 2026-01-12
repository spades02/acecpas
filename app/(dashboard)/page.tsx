import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, Clock, FolderOpen, MoreVertical, TrendingUp } from "lucide-react";
import { MOCK_DEALS as deals } from "@/data/deals-data"
import { DealsTable } from "@/components/pages/deals/deals-table";
import { Suspense } from "react";
import { DealsSection } from "@/components/pages/deals/deals-section";
import Link from "next/link";

export default function Home({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      'mapping': { label: 'Mapping', className: 'bg-amber-100 text-amber-800 border-amber-200' },
      'complete': { label: 'Complete', className: 'bg-green-100 text-green-800 border-green-200' },
      'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-800 border-blue-200' },
    };
    const variant = variants[status] || variants['in-progress'];
    return <Badge className={variant.className} variant="outline">{variant.label}</Badge>;
  };
  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, John Davis</h1>
        <p className="text-muted-foreground">Here's what's happening with your deals today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        {/* Active Deals */}
        <Card className="p-4 border-l-4 border-l-primary">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold text-foreground">12</div>
            <div className="text-xs font-medium text-muted-foreground">Active Deals</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>+3 this week</span>
            </div>
          </div>
        </Card>

        {/* Completed This Month */}
        <Card className="p-4 border-l-4 border-l-green-600">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold text-foreground">8</div>
            <div className="text-xs font-medium text-muted-foreground">Completed This Month</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>+2 from last month</span>
            </div>
          </div>
        </Card>

        {/* Open Items Pending */}
        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold text-foreground">47</div>
            <div className="text-xs font-medium text-muted-foreground">Open Items Pending</div>
            <Badge className="bg-red-100 text-red-800 text-xs px-2 py-0.5">
              8 High Priority
            </Badge>
          </div>
        </Card>

        {/* Hours Saved */}
        <Card className="p-4 border-l-4 border-l-teal-600">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl font-bold text-foreground">342</div>
            <div className="text-xs font-medium text-muted-foreground">Hours Saved This Quarter</div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>+18%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Deals Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-foreground">Recent Deals</h2>
          <Link href={"/deals/create-deal"}>
          <Button 
          // onClick={() => onNavigate('create-deal')}
          >
            + Create New Deal
          </Button>
          </Link>
        </div>

        {/* Deals Table */}
        <Suspense fallback={<div className="p-10 text-center">Loading deals...</div>}>
        <DealsSection searchParams={searchParams} />
      </Suspense>
          </div>
      </div>
  );
}
