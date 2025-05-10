
"use client";
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { SidebarNav } from "./sidebar-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, UserCircle, LogOut, CreditCard, CheckCircle, Circle, Trash2, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@/context/user-context';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const { 
    currentUser, 
    logoutUser, 
    notifications, 
    unreadNotificationCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    clearNotifications,
    getSubscriptionDaysRemaining,
    addNotification // For testing
  } = useUser();

  const handleTestNotification = () => {
    const types: Array<'system' | 'user' | 'admin' | 'arduino'> = ['system', 'user', 'admin', 'arduino'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    addNotification(`This is a test ${randomType} notification at ${new Date().toLocaleTimeString()}`, randomType);
  };
  
  return (
    <SidebarProvider defaultOpen={!isMobile} collapsible={isMobile ? "offcanvas" : "icon"}>
      <Sidebar variant="sidebar" side="left" className="border-r border-sidebar-border">
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex items-center">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold ml-2 hidden sm:block">IoT Guardian</h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Test Notification Button - Remove in production */}
            {/* <Button variant="outline" size="sm" onClick={handleTestNotification}>Test Notif</Button> */}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
                  <Bell className={cn("h-5 w-5", unreadNotificationCount > 0 && "text-destructive")} />
                  {unreadNotificationCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 min-w-[1rem] p-0 flex items-center justify-center text-xs rounded-full">
                      {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 sm:w-96">
                <DropdownMenuLabel className="flex justify-between items-center">
                  <span>Notifications</span>
                  {notifications.length > 0 && (
                     <Button variant="ghost" size="sm" onClick={markAllNotificationsAsRead} className="text-xs h-auto py-1 px-2">Mark all as read</Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  {notifications.length === 0 ? (
                    <DropdownMenuItem disabled className="justify-center text-muted-foreground">No new notifications</DropdownMenuItem>
                  ) : (
                    notifications.map(notif => (
                      <DropdownMenuItem key={notif.id} onSelect={(e) => e.preventDefault()} className={cn("flex items-start gap-2", !notif.read && "font-semibold")}>
                         {notif.read ? <Circle className="h-3 w-3 mt-1 text-muted-foreground/50"/> : <CheckCircle className="h-3 w-3 mt-1 text-accent"/>}
                        <div className="flex-1">
                          <p className="text-sm leading-tight">{notif.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })} ({notif.type})
                          </p>
                        </div>
                        {!notif.read && (
                           <Button variant="ghost" size="sm" className="h-auto py-0.5 px-1.5 text-xs" onClick={() => markNotificationAsRead(notif.id)}>Read</Button>
                        )}
                      </DropdownMenuItem>
                    ))
                  )}
                </ScrollArea>
                {notifications.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={clearNotifications} className="text-destructive hover:!bg-destructive/10 justify-center">
                      <Trash2 className="mr-2 h-4 w-4" /> Clear All Notifications
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="User Profile">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {currentUser?.isLoggedIn ? (
                  <>
                    <DropdownMenuLabel>
                      <p className="font-medium">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>
                       <p className="text-xs w-full">
                         Plan: <span className="font-semibold">{currentUser.subscription.planName}</span>
                       </p>
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                       <p className="text-xs w-full">
                         {getSubscriptionDaysRemaining()}
                       </p>
                    </DropdownMenuItem>
                     <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/subscriptions">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Manage Subscription
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logoutUser}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Guest</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                       <Link href="/auth/login"><LogOut className="mr-2 h-4 w-4" />Login</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <footer className="py-4 px-6 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} IoT Guardian. All rights reserved.
          {/* <Button size="sm" variant="link" onClick={handleTestNotification} className="ml-4">Simulate Notification</Button> */}
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
