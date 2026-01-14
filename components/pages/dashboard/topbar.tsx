'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Bell, ChevronDown, HelpCircle, LogOut, Search, Settings, User } from "lucide-react"
import { DynamicBreadcrumb } from "./dynamic-breadcrumb"

function Topbar() {
  const { user, isLoading } = useUser();

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="h-18 w-full bg-white border-b border-border shadow-sm px-6 flex items-center justify-between sticky top-0 z-50">
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
              {/* {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {unreadCount}
                </span>
              )} */}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold">Notifications</div>
              {/* {unreadCount > 0 && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  {unreadCount} new
                </Badge>
              )} */}
            </div>
            {/* <div className="max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`px-4 py-3 cursor-pointer focus:bg-muted ${notification.unread ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      notification.type === 'success' ? 'bg-green-500' :
                      notification.type === 'warning' ? 'bg-amber-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground">{notification.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{notification.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">{notification.time}</div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div> */}
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
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                  {isLoading ? '...' : getUserInitials()}
                </div>
              )}
              <div className="text-left hidden md:block">
                <div className="text-sm font-medium">
                  {isLoading ? 'Loading...' : user?.name || 'User'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isLoading ? '' : user?.email || ''}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-4 py-3 border-b">
              <div className="font-medium">{user?.name || 'User'}</div>
              <div className="text-sm text-muted-foreground">{user?.email || ''}</div>
            </div>
            <DropdownMenuItem
              // onClick={() => onNavigate?.('dashboard')} 
              className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              // onClick={() => onNavigate?.('settings')} 
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
