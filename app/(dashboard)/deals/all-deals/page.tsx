import { DealsTable } from "@/components/pages/deals/deals-table";
import { DealsStats } from "@/components/pages/deals/deals-stats";
import { loadDealsAndStats } from "@/lib/data-loaders";

export default async function AllDealsPage({
  searchParams,
}: {
  searchParams: Promise<any>; // Matches the type expected by our loader
}) {
  // 1. Call the loader
  const { deals, stats, pagination } = await loadDealsAndStats(searchParams, 'all');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Deals</h1>
        <p className="text-muted-foreground">Manage all your engagements</p>
      </div>

      {/* 2. Render Stats */}
      {/* We spread the stats object directly if properties match, or pass specific props */}
      <DealsStats {...stats} />

      {/* 3. Render Table */}
      <DealsTable 
        data={deals} 
        // Pass the raw count so the table can calculate "Showing 1-3 of 10"
        totalItems={pagination.totalCount} 
        itemsPerPage={pagination.limit}
        currentPage={pagination.currentPage}
        viewMode="detailed"
      />
    </div>
  );
}