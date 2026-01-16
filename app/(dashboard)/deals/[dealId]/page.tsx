import { DealView } from "@/components/pages/deals/deal-view";
import { headers } from "next/headers";

// Fetch deal data on server
async function getDeal(dealId: string) {
  // Use absolute URL for server-side fetches
  const headersList = await headers(); // Next.js 15 requires awaiting headers
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";

  const res = await fetch(`${protocol}://${host}/api/deals/${dealId}`, {
    headers: {
      cookie: headersList.get("cookie") || ""
    },
    cache: "no-store", // Deals change frequently
  });

  if (!res.ok) {
    throw new Error("Failed to fetch deal");
  }

  const data = await res.json();
  return data.deal;
}

export default async function DealPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const { dealId } = await params;
  const deal = await getDeal(dealId);

  return <DealView deal={deal} />;
}