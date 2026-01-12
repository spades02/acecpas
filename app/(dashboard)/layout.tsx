import AppSidebar from "@/components/pages/dashboard/app-sidebar";
import Topbar from "@/components/pages/dashboard/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
      <AppSidebar />
      {/* SidebarInset fills the remaining space automatically */}
      <SidebarInset>
        <Topbar />
        <main>
          {children}
        </main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
    )
}