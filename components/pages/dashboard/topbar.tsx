'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown, HelpCircle, LogOut, Search, Settings, User } from "lucide-react"
import { DynamicBreadcrumb } from "./dynamic-breadcrumb"

import { useAuth } from '@/components/providers/auth-provider'; // Add this import
// ... existing imports

function Topbar() {
  const { user: auth0User, isLoading: auth0Loading } = useUser();
  const { profile, isLoading: profileLoading } = useAuth();

  const isLoading = auth0Loading || profileLoading;

  const currentName = profile?.full_name || auth0User?.name || 'User';
  const currentEmail = profile?.email || auth0User?.email || '';
  const currentPicture = profile?.avatar_url || auth0User?.picture;

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentName) return 'U';
    const names = currentName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return currentName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="h-16 w-full bg-white border-b border-border shadow-sm px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Breadcrumb */}
      <DynamicBreadcrumb />

      {/* Right Section */}
      <div className="flex items-center justify-end gap-4">
        {/* Search */}
        <Button variant="ghost" size="icon" className="relative">
          <Search className="w-5 h-5" />
        </Button>

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold">Notifications</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="px-4 py-2 text-center text-sm text-primary cursor-pointer">
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-auto p-2">
              {currentPicture ? (
                <img
                  src={currentPicture}
                  alt={currentName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                  {isLoading ? '...' : getUserInitials()}
                </div>
              )}
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium">
                  {isLoading ? 'Loading...' : currentName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isLoading ? '' : currentEmail}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-4 py-3 border-b">
              <div className="font-medium">{currentName}</div>
              <div className="text-sm text-muted-foreground">{currentEmail}</div>
            </div>
            <DropdownMenuItem
              className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <HelpCircle className="w-4 h-4 mr-2" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default Topbar
