// components/pages/deals/deals-section.tsx
import { loadDealsAndStats } from "@/lib/data-loaders";
import { DealsTable } from "@/components/pages/deals/deals-table";

// This component IS async, but it's nested inside Home
export async function DealsSection({ searchParams }: { searchParams: Promise<any> }) {
  // logic happens here
  const { deals, stats, pagination } = await loadDealsAndStats(searchParams, 'all');

  return (
    <div className="space-y-6">
      <DealsTable 
        data={deals} 
        totalItems={pagination.totalCount} 
        itemsPerPage={pagination.limit}
        currentPage={pagination.currentPage}
        viewMode="home"
      />
    </div>
  );
}