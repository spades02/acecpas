import AppSidebar from "@/components/pages/dashboard/app-sidebar";
import Topbar from "@/components/pages/dashboard/topbar";
import { ProfileCompletionModal } from "@/components/auth/profile-completion-modal";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 overflow-x-hidden">
      <AuthProvider>
        <SidebarProvider>
          <AppSidebar />
          {/* SidebarInset fills the remaining space automatically */}
          <SidebarInset>
            <Topbar />
            <main>
              {children}
            </main>
            <Toaster />
            <ProfileCompletionModal />
          </SidebarInset>
        </SidebarProvider>
      </AuthProvider>
    </div>
  )
}
