import { headers } from "next/headers";
import { DealHeader } from "@/components/pages/deals/deal-header";

// Fetch deal data on server (reused logic)
async function getDeal(dealId: string) {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";

    const res = await fetch(`${protocol}://${host}/api/deals/${dealId}`, {
        headers: {
            cookie: headersList.get("cookie") || ""
        },
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch deal");
    }

    const data = await res.json();
    return data.deal;
}

export default async function DealLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ dealId: string }>;
}) {
    const { dealId } = await params;
    const deal = await getDeal(dealId);

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            <DealHeader deal={deal} />
            <div className="flex-1 bg-slate-50/50 p-6 w-full overflow-auto">
                {children}
            </div>
        </div>
    );
}
