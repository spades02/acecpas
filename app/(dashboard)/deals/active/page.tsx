import { getDeals, getDealStats } from "@/lib/deals-api";
import { DealsTable } from "@/components/pages/deals/deals-table";
import { loadDealsAndStats } from "@/lib/data-loaders";

export default async function ActiveDealsPage({
  searchParams,
}: {
  searchParams: Promise<any>; // Next.js automatically passes searchParams to pages
}) {
  const { deals, stats, pagination } = await loadDealsAndStats(searchParams, 'active');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Active Deals</h1>
        <p className="text-muted-foreground">Deals currently in progress</p>
      </div>

      {/* Client Table hydrated with server data */}
      <DealsTable 
        data={deals} 
        totalItems={pagination.totalCount} 
        itemsPerPage={pagination.limit}
        currentPage={pagination.currentPage}
        viewMode="detailed"
      />
    </div>
  );
}