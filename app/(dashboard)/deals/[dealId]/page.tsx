import Link from "next/link";
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Check, 
  ArrowLeft, 
  Download, 
  Search, 
  Calendar,
  DollarSign,
  Briefcase
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { BackButton } from "@/components/ui/back-button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// 1. Mock Data Fetching (Replace with your DB call)
async function getDealData(id: string) {
  // Simulate DB Delay
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    id,
    name: "Acme Corp Acquisition",
    client: "Acme Industries Inc.",
    value: 5000000,
    status: "Due Diligence",
    lastUpdated: "Today at 2:45 PM",
    stats: {
      completedTasks: 12,
      pendingTasks: 5,
      daysOpen: 24
    },
    // The "List" content (Tasks, Documents, or Audit Log)
    tasks: [
      { id: '1', title: 'Financial Statements Review', assignee: 'Sarah Chen', due: 'Tomorrow', status: 'completed', priority: 'high' },
      { id: '2', title: 'Legal Contract Draft', assignee: 'Mike Ross', due: 'Jan 15', status: 'in-progress', priority: 'high' },
      { id: '3', title: 'Tech Stack Audit', assignee: 'John Doe', due: 'Jan 20', status: 'pending', priority: 'medium' },
      { id: '4', title: 'Competitor Analysis', assignee: 'Sarah Chen', due: 'Feb 1', status: 'completed', priority: 'low' },
      { id: '5', title: 'QoE Report Generation', assignee: 'System', due: 'N/A', status: 'pending', priority: 'high' },
    ]
  };
}

// 2. The Page Component
export default async function DealPage({ params }: { params: Promise<{ dealId: string }> }) {
  // Next.js 15+ requires awaiting params
  const { dealId } = await params;
  const deal = await getDealData(dealId);

  // Helper for status icons
  const getStatusIcon = (status: string) => {
    if (status === 'completed') return <div className="w-2 h-2 bg-green-500 rounded-full" />;
    if (status === 'in-progress') return <div className="w-2 h-2 bg-amber-500 rounded-full" />;
    return <div className="w-2 h-2 bg-gray-300 rounded-full" />;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      
      {/* --- TOP HEADER: Breadcrumb & Meta --- */}
      <div className="bg-white border-b border-border p-6 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <BackButton fallbackRoute="/deals/all-deals"/>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              {deal.name}
              <Badge variant="outline" className="text-base font-normal">{deal.status}</Badge>
            </h1>
            <div className="text-muted-foreground flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> {deal.client}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Updated: {deal.lastUpdated}</span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full">
            <Check className="w-3.5 h-3.5 text-green-600" />
            <span>All changes saved</span>
          </div>
        </div>

        {/* --- STATS GRID (The "Mapper" Style Cards) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          
          {/* Card 1: Value (Green Theme) */}
          <Card className="p-5 border-l-4 border-l-green-600 bg-green-50/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-foreground">
                    ${(deal.value / 1000000).toFixed(1)}M
                </div>
                <Badge className="bg-green-100 text-green-800 text-xs mt-1 border-green-200">Total Deal Value</Badge>
              </div>
            </div>
          </Card>

          {/* Card 2: Progress (Amber Theme) */}
          <Card className="p-5 border-l-4 border-l-amber-500 bg-amber-50/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-foreground">
                    {deal.stats.completedTasks} / {deal.stats.completedTasks + deal.stats.pendingTasks}
                </div>
                <Badge className="bg-amber-100 text-amber-800 text-xs mt-1 border-amber-200">Tasks Completed</Badge>
              </div>
            </div>
          </Card>

          {/* Card 3: Time (Blue/Red Theme) */}
          <Card className="p-5 border-l-4 border-l-blue-500 bg-blue-50/30">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-foreground">{deal.stats.daysOpen} Days</div>
                <Badge className="bg-blue-100 text-blue-800 text-xs mt-1 border-blue-200">Time in Stage</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* --- FILTER & ACTION TOOLBAR --- */}
      <div className="bg-white border-b border-border px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left - Filters */}
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <Button variant="default" size="sm">All Tasks</Button>
              <Button variant="ghost" size="sm">Pending</Button>
              <Button variant="ghost" size="sm">Completed</Button>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block"></div>
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search tasks..." className="pl-9 bg-muted h-9" />
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              + New Task
            </Button>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID (Tasks/Items) --- */}
      <div className="flex-1 rounded-2xl overflow-auto bg-slate-50/50 p-6">
          <Table className="w-full border">
            <TableHeader className="bg-muted border-b border-border">
              <TableRow>
                <TableHead className="w-12 px-4 py-3"><Checkbox /></TableHead>
                <TableHead className="w-12 px-2 py-3"></TableHead>
                <TableHead className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">Task Name</TableHead>
                <TableHead className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">Assignee</TableHead>
                <TableHead className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">Due Date</TableHead>
                <TableHead className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-3">Priority</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase px-4 py-3 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border bg-white">
              {deal.tasks.map((task) => (
                <TableRow key={task.id} className="hover:bg-muted/50 transition-colors group">
                  <TableCell className="px-2 py-3">{getStatusIcon(task.status)}</TableCell>
                  <TableCell className="px-4 py-3"><Checkbox /></TableCell>
                  <TableCell className="px-4 py-3 font-medium text-foreground">{task.title}</TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center">
                        {task.assignee.charAt(0)}
                    </div>
                    {task.assignee}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">{task.due}</TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge variant="outline" className={
                        task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 
                        task.priority === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                    }>
                        {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Empty State visual helper (if needed) */}
          {deal.tasks.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
                No tasks found for this deal.
            </div>
          )}
      </div>

    </div>
  );
}