
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  HardDrive,
  Wrench,
  CreditCard,
  LogIn,
  UserPlus,
  ShieldQuestion,
  Settings,
  Bot,
  LogOut,
  ShieldCheck,
  ShoppingCart, // Added ShoppingCart
  type LucideIcon,
  UserCircle, 
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/icons/logo";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { useAdminAuth } from "@/context/admin-auth-context";
import { useUser } from "@/context/user-context"; 
import { Button } from "../ui/button";


interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchExact?: boolean;
  subItems?: NavItem[];
  adminOnly?: boolean; 
  userOnly?: boolean; 
  guestOnly?: boolean; 
  action?: () => void; 
}

const commonNavItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, matchExact: true },
  { href: "/products", label: "Shop Products", icon: ShoppingCart }, // Added Shop Products link
  { href: "/troubleshoot", label: "AI Troubleshoot", icon: Bot },
  { href: "/issues", label: "Common Issues", icon: Wrench },
];

const userSpecificNavItems: NavItem[] = [
   { href: "/subscriptions", label: "My Subscription", icon: CreditCard, userOnly: true },
];

const adminNavItemsSection: NavItem = {
  href: "/admin",
  label: "Admin Panel",
  icon: Settings,
  adminOnly: true, 
  subItems: [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, matchExact: true, adminOnly: true },
    { href: "/admin/devices", label: "Devices", icon: HardDrive, adminOnly: true },
    { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
    { href: "/admin/manage-issues", label: "Manage Issues", icon: ShieldQuestion, adminOnly: true },
  ],
};

const authNavItems: NavItem[] = [
  { href: "/auth/login", label: "User Login", icon: LogIn, guestOnly: true },
  { href: "/auth/register", label: "User Register", icon: UserPlus, guestOnly: true },
  { href: "/auth/admin-login", label: "Admin Login", icon: ShieldCheck, guestOnly: true }, 
];


export function SidebarNav() {
  const pathname = usePathname();
  const { isAdmin, logout: adminLogout, isLoading: isAdminAuthLoading } = useAdminAuth();
  const { currentUser, logoutUser: regularUserLogout } = useUser(); 

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    if (item.adminOnly && !isAdmin) return null;
    if (item.userOnly && (!currentUser || !currentUser.isLoggedIn || isAdmin)) return null; 
    if (item.guestOnly && (isAdmin || (currentUser && currentUser.isLoggedIn))) return null;


    const isActive = item.matchExact ? pathname === item.href : pathname.startsWith(item.href);
    const ButtonComponent = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;
    
    const navItemContent = (
      <>
        <item.icon className="mr-2 h-5 w-5" />
        <span className="truncate">{item.label}</span>
      </>
    );
    
    const effectiveHref = (item.adminOnly && !isAdmin && !item.href.startsWith('/auth/admin-login')) ? "/auth/admin-login" : item.href;

    if (item.action) {
      return (
        <SidebarMenuItem key={item.label + "-action"}>
          <ButtonComponent
            onClick={item.action}
            className={cn("w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}
            tooltip={item.label}
          >
            {navItemContent}
          </ButtonComponent>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem key={item.href}>
        <Link href={effectiveHref} passHref legacyBehavior>
          <ButtonComponent
            className={cn(isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", "w-full justify-start")}
            isActive={isActive}
            asChild={!isSubItem} 
            tooltip={item.label}
          >
           {!isSubItem ? <a>{navItemContent}</a> : navItemContent}
          </ButtonComponent>
        </Link>
        {item.subItems && (item.adminOnly ? isAdmin : true) && isActive && (
          <SidebarMenuSub>
            {item.subItems.map(subItem => renderNavItem(subItem, true))}
          </SidebarMenuSub>
        )}
      </SidebarMenuItem>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center justify-between">
         <Link href="/" className="flex items-center gap-2">
          <Logo className="h-10 w-auto"/>
        </Link>
      </div>
      <Separator className="bg-sidebar-border my-2" />
      <SidebarMenu className="flex-1 px-2 py-2 space-y-1">
        {commonNavItems.map(item => renderNavItem(item))}
        {userSpecificNavItems.map(item => renderNavItem(item))}
        {renderNavItem(adminNavItemsSection)}
      </SidebarMenu>
      <Separator className="bg-sidebar-border my-2" />
      <SidebarMenu className="px-2 py-2 space-y-1">
        {authNavItems.map(item => renderNavItem(item))}
        {isAdmin && (
          renderNavItem({ href: "#", label: "Admin Logout", icon: LogOut, action: adminLogout })
        )}
        {currentUser && currentUser.isLoggedIn && !isAdmin && ( 
          renderNavItem({ href: "#", label: "User Logout", icon: LogOut, action: regularUserLogout })
        )}
      </SidebarMenu>
    </div>
  );
}
