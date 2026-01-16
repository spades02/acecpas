'use client'

import { useUser } from '@auth0/nextjs-auth0/client'
import { usePathname } from 'next/navigation'
import { ChevronDown, ClipboardMinus, Folder, FolderArchive, FolderOpenDot, Handshake, HelpCircle, Home, LogOut, Settings, User } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
// import { useEffect, useState } from 'react'

const mainItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: ClipboardMinus,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

const dealItems = [
  { title: "All Deals", url: "/deals/all-deals", icon: Folder },
  { title: "Active", url: "/deals/active", icon: FolderOpenDot },
  { title: "Completed", url: "/deals/completed", icon: Handshake },
  { title: "Archived", url: "/deals/archived", icon: FolderArchive },
]

// ... imports
import { useAuth } from '@/components/providers/auth-provider'

export default function AppSidebar() {
  const pathname = usePathname();
  const { profile, isLoading } = useAuth(); // Remove 'user'

  // We can still use useUser for the picture if needed
  const { user: auth0User } = useUser();

  const currentName = profile?.full_name || auth0User?.name || 'User';
  const currentEmail = profile?.email || auth0User?.email || '';
  const currentPicture = profile?.avatar_url || auth0User?.picture;

  // Check if we are in a deal context (e.g., /deals/[uuid])
  const isDealContext = pathname?.match(/\/deals\/[0-9a-fA-F-]{36}/);

  // In a real app, we might want to fetch the deal name here or pass it via context
  // Placeholder until context value is available
  const currentDealName = "Acme Corp Acquisition";
  const currentDealProgress = 50;

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!currentName) return 'U';
    const names = currentName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return currentName.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="h-16 flex items-center px-6 border-b w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">
              AC
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">AceCPAs</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Collapsible defaultOpen={!isDealContext} className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Deals
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {dealItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathname?.startsWith(item.url)}>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>

        {/* Current Deal Section - Only visible when in a deal */}
        {isDealContext && (
          <div className="mt-4 mx-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Current Deal</div>
            <div className="font-semibold text-sm text-foreground mb-1 truncate" title={currentDealName}>
              {currentDealName}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{currentDealProgress}%</span>
              </div>
              <Progress value={currentDealProgress} className="h-1.5" />
            </div>

            <div className="mt-4 space-y-1">
              {/* Deal Specific Context Links Could Go Here */}
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.endsWith('/files')}>
                    <span className="text-xs font-medium pl-0">Upload Files</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.endsWith('/mapper')}>
                    <span className="text-xs font-medium pl-0">Mapper</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.endsWith('/open-items')}>
                    <span className="text-xs font-medium pl-0">Open Items</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.endsWith('/reports')}>
                    <span className="text-xs font-medium pl-0">Reports</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </div>
          </div>
        )}

      </SidebarContent>

      <SidebarFooter>
        <div className="px-3 py-4 border-t border-sidebar-border space-y-2">
          <button
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-accent"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Help & Docs</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent">
              {currentPicture ? (
                <img
                  src={currentPicture}
                  alt={currentName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold">
                  {isLoading ? '...' : getUserInitials()}
                </div>
              )}
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-sidebar-foreground">
                  {isLoading ? 'Loading...' : currentName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isLoading ? '' : currentEmail}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center gap-2 text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
