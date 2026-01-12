import { FolderOpen, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DealsStatsProps {
  total: number;
  active: number;
  completed: number;
  archived: number;
}

export function DealsStats({ total, active, completed, archived }: DealsStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-6">
      <Card className="p-4 border-l-4 border-l-primary">
        <div className="flex items-center gap-3 mb-2">
          <FolderOpen className="w-7 h-7 text-primary" />
        </div>
        <div className="text-2xl font-bold text-foreground">{total}</div>
        <div className="text-xs font-medium text-muted-foreground">Total Deals</div>
      </Card>

      <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50/30">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-7 h-7 text-blue-600" />
        </div>
        <div className="text-2xl font-bold text-foreground">{active}</div>
        <div className="text-xs font-medium text-muted-foreground">Active Deals</div>
      </Card>

      <Card className="p-4 border-l-4 border-l-green-500 bg-green-50/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-lg">✓</div>
        </div>
        <div className="text-2xl font-bold text-foreground">{completed}</div>
        <div className="text-xs font-medium text-muted-foreground">Completed</div>
      </Card>

      <Card className="p-4 border-l-4 border-l-gray-500 bg-gray-50/30">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 text-lg">📦</div>
        </div>
        <div className="text-2xl font-bold text-foreground">{archived}</div>
        <div className="text-xs font-medium text-muted-foreground">Archived</div>
      </Card>
    </div>
  );
}