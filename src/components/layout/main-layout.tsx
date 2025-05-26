
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
import { Bell, UserCircle, LogOut, CreditCard, CheckCircle, Circle, Trash2, Home, LayoutDashboard, UserPlus } from 'lucide-react'; // Added LayoutDashboard, UserPlus
import { useIsMobile } from '@/hooks/use-mobile';
import { useUser } from '@/context/user-context';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { usePathname } from 'next/navigation'; // To detect landing page
import { Logo } from '../icons/logo'; // For header logo

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const { 
    currentUser, 
    logoutUser, 
    notifications, 
    unreadNotificationCount, 
    markNotificationAsRead, 
    markAllNotificationsAsRead,
    clearNotifications,
    getSubscriptionDaysRemaining,
  } = useUser();

  const isLandingPage = pathname === '/';
  
  // For landing page, we might want to simplify the sidebar or hide it by default on desktop.
  // Here, we ensure it's collapsible and can be closed.
  const sidebarDefaultOpen = !isMobile && !isLandingPage;


  return (
    <SidebarProvider defaultOpen={sidebarDefaultOpen} collapsible={isMobile ? "offcanvas" : "icon"}>
      {!isLandingPage && ( // Only show sidebar if not on the landing page
        <Sidebar variant="sidebar" side="left" className="border-r border-sidebar-border">
          <SidebarContent>
            <SidebarNav />
          </SidebarContent>
        </Sidebar>
      )}
      <SidebarInset className={cn(isLandingPage && "md:ml-0")}> {/* Remove margin for landing page on desktop */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-background/80 backdrop-blur-sm border-b">
          <div className="flex items-center">
            {isLandingPage ? (
               <Link href="/" className="flex items-center gap-2 mr-4">
                <Logo className="h-8 w-auto"/>
              </Link>
            ) : (
              <SidebarTrigger className={cn(isMobile ? "mr-2" : "md:hidden mr-2")} />
            )}
             {!isLandingPage && <h1 className="text-xl font-semibold ml-2 hidden sm:block">IoT Guardian</h1>}
          </div>

          {/* Navigation for landing page header */}
          {isLandingPage && (
            <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
              <Link href="#services" className="text-muted-foreground hover:text-primary transition-colors">Services</Link>
              <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link>
              <Link href="/subscriptions" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
              {currentUser?.isLoggedIn ? (
                 <Button variant="ghost" asChild>
                    <Link href="/dashboard">Dashboard</Link>
                 </Button>
              ) : (
                 <Button variant="ghost" asChild>
                    <Link href="/auth/login">Login</Link>
                 </Button>
              )}
            </nav>
          )}


          <div className="flex items-center gap-2 md:gap-3">
            {!isLandingPage && ( // Only show these if not on landing page, or adapt for landing page
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
            )}

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
                     <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/subscriptions">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Manage Subscription
                      </Link>
                    </DropdownMenuItem>
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
                    <DropdownMenuItem onClick={logoutUser}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Guest Menu</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem asChild>
                       <Link href="/"><Home className="mr-2 h-4 w-4" />Home</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                       <Link href="/auth/login"><LogOut className="mr-2 h-4 w-4" />Login</Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                       <Link href="/auth/register"><UserPlus className="mr-2 h-4 w-4" />Register</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {isLandingPage && isMobile && <SidebarTrigger />} 
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8"> {/* Added padding here */}
          {children}
        </main>
        <footer className="py-6 px-6 border-t text-center text-sm text-muted-foreground bg-background">
          © {new Date().getFullYear()} IoT Guardian. All rights reserved. Empowering Your Connected World.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

    