import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Clock, FolderOpen, TrendingUp } from "lucide-react";
import { Suspense } from "react";
import { DealsSection } from "@/components/pages/deals/deals-section";
import Link from "next/link";
import { getDealStats } from "@/lib/deals-api";

// Stats Card Component
function StatsCard({
  icon: Icon,
  value,
  label,
  trend,
  borderColor,
  iconBg,
  iconColor
}: {
  icon: React.ElementType
  value: number | string
  label: string
  trend?: string
  borderColor: string
  iconBg: string
  iconColor: string
}) {
  return (
    <Card className={`p-4 border-l-4 ${borderColor}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </div>
      <div className="space-y-0.5">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        {trend && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span>{trend}</span>
          </div>
        )}
      </div>
    </Card>
  )
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<any>;
}) {
  // Fetch real stats from Supabase
  const stats = await getDealStats();

  return (
    <div className="p-6 space-y-8">
      {/* Hero Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
        <p className="text-muted-foreground">Here's what's happening with your deals today</p>
      </div>

      {/* Stats Cards - Now with real data */}
      <div className="grid grid-cols-4 gap-6">
        <StatsCard
          icon={FolderOpen}
          value={stats.active}
          label="Active Deals"
          trend={stats.active > 0 ? `${stats.active} in progress` : undefined}
          borderColor="border-l-primary"
          iconBg="bg-primary/10"
          iconColor="text-primary"
        />

        <StatsCard
          icon={CheckCircle}
          value={stats.completed}
          label="Completed Deals"
          trend={stats.completed > 0 ? "All time" : undefined}
          borderColor="border-l-green-600"
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />

        <StatsCard
          icon={AlertTriangle}
          value={stats.draft}
          label="Draft Deals"
          borderColor="border-l-amber-500"
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />

        <StatsCard
          icon={Clock}
          value={stats.total}
          label="Total Deals"
          borderColor="border-l-teal-600"
          iconBg="bg-teal-100"
          iconColor="text-teal-600"
        />
      </div>

      {/* Recent Deals Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-foreground">Recent Deals</h2>
          <Link href="/deals/create-deal">
            <Button>+ Create New Deal</Button>
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
