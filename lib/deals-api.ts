import { Deal, MOCK_DEALS, DealCategory } from "@/data/deals-data";

// Define the return type explicitly
interface GetDealsResponse {
  deals: Deal[];
  totalCount: number;
}

// SIMULATE SERVER DATABASE FETCH
export async function getDeals(
  category: DealCategory | 'all' = 'all', // default to 'all'
  pageNumber: number = 1,                 // default to page 1
  pageSize: number = 10                   // default pageSize
): Promise<GetDealsResponse> {
  
  // 1. Filter by category
  let filteredDeals = MOCK_DEALS;
  if (category !== 'all') {
    filteredDeals = MOCK_DEALS.filter(deal => deal.category === category);
  }

  // 2. Calculate Total Count (before slicing)
  const totalCount = filteredDeals.length;

  // 3. Apply Pagination (Slice the array)
  const startIndex = (pageNumber - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDeals = filteredDeals.slice(startIndex, endIndex);

  // Return both data and count
  return {
    deals: paginatedDeals,
    totalCount: totalCount,
  };
}

export async function getDealStats() {
  return {
    total: MOCK_DEALS.length,
    active: MOCK_DEALS.filter(d => d.category === 'active').length,
    completed: MOCK_DEALS.filter(d => d.category === 'completed').length,
    archived: MOCK_DEALS.filter(d => d.category === 'archived').length,
  };
}