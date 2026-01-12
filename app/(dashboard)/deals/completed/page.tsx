import { DealsTable } from "@/components/pages/deals/deals-table";
import { loadDealsAndStats } from "@/lib/data-loaders";

export default async function CompletedDealsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>; // Next.js automatically passes searchParams to pages
}) {
  const { deals, stats, pagination } = await loadDealsAndStats(searchParams, 'completed');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Completed Deals</h1>
        <p className="text-muted-foreground">Recently completed deals</p>
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