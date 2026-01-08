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
  
  export default function AppSidebar() {
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
                  <SidebarMenuButton asChild>
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

        {/* Collapsible Deals Group */}
        <Collapsible className="group/collapsible">
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
                      <SidebarMenuButton asChild>
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
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold">
              JD
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-sidebar-foreground">John Davis</div>
              <div className="text-xs text-muted-foreground">Admin</div>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuItem className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2">
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