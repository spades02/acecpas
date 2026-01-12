import { getDeals, getDealStats } from "@/lib/deals-api";

export const ITEMS_PER_PAGE = 3;

// Define valid filter types for TypeScript safety (optional but recommended)
type DealFilter = 'all' | 'active' | 'archived' | 'completed';

export async function loadDealsAndStats(
  searchParams: Promise<any>, 
  filter: DealFilter // <--- New argument here
) {
  const params = await searchParams;
  const currentPage = Number(params?.page) || 1;

  // Pass the dynamic 'filter' variable instead of hardcoded 'all'
  const [dealsData, stats] = await Promise.all([
    getDeals(filter, currentPage, ITEMS_PER_PAGE), 
    getDealStats(),
  ]);

  return {
    deals: dealsData.deals,
    stats,
    pagination: {
      currentPage,
      totalPages: Math.ceil(dealsData.totalCount / ITEMS_PER_PAGE),
      totalCount: dealsData.totalCount,
      limit: ITEMS_PER_PAGE
    }
  };
}