
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
  LogOut,
  Home,
  Info,
  Mail,
  type LucideIcon,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/icons/logo";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { useAdminAuth } from "@/context/admin-auth-context";
import { useUser } from "@/context/user-context";

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
  isPublic?: boolean;
  sectionBreak?: boolean;
}

const publicNavItems: NavItem[] = [
   { href: "/", label: "Home", icon: Home, matchExact: true, isPublic: true },
];

const commonUserNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, userOnly: true },
  { href: "/troubleshoot", label: "Troubleshoot", icon: Wrench, userOnly: true },
  { href: "/issues", label: "Common Issues", icon: ShieldQuestion, userOnly: true },
  { href: "/subscriptions", label: "My Subscription", icon: CreditCard, userOnly: true, sectionBreak: true },
];

const generalInfoNavItems: NavItem[] = [
  { href: "/about", label: "About Us", icon: Info, isPublic: true},
  { href: "/contact", label: "Contact Us", icon: Mail, isPublic: true, sectionBreak: true },
];

const adminNavItems: NavItem[] = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, matchExact: true, adminOnly: true },
    { href: "/admin/users", label: "Users", icon: Users, adminOnly: true },
    // Simplified admin panel, removing device and issue management for now
];


const authNavItems: NavItem[] = [
  { href: "/auth/login", label: "Login", icon: LogIn, guestOnly: true },
  { href: "/auth/register", label: "Register", icon: UserPlus, guestOnly: true },
];


export function SidebarNav() {
  const pathname = usePathname();
  const { isAdmin, logout: adminLogout } = useAdminAuth();
  const { currentUser, logoutUser: regularUserLogout } = useUser();
  const isUserLoggedIn = !!currentUser?.isLoggedIn;
  
  const renderNavItem = (item: NavItem) => {
    if (item.adminOnly && !isAdmin) return null;
    if (item.userOnly && (!isUserLoggedIn || isAdmin)) return null;
    if (item.guestOnly && (isAdmin || isUserLoggedIn)) return null;

    const isActive = item.matchExact ? pathname === item.href : pathname.startsWith(item.href);

    const menuItem = (
      <SidebarMenuItem key={item.label + (item.action ? "-action" : item.href)}>
        {item.action ? (
          <SidebarMenuButton
            onClick={item.action}
            className="w-full justify-start"
            tooltip={item.label}
          >
            <item.icon className="mr-2 h-5 w-5" /> {item.label}
          </SidebarMenuButton>
        ) : (
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              className="w-full justify-start"
              isActive={isActive}
              asChild
              tooltip={item.label}
            >
              <a><item.icon className="mr-2 h-5 w-5" /> {item.label}</a>
            </SidebarMenuButton>
          </Link>
        )}
      </SidebarMenuItem>
    );
     if (item.sectionBreak) {
        return (
            <React.Fragment key={item.label + "-fragment"}>
                {menuItem}
                <Separator className="bg-sidebar-border my-2" />
            </React.Fragment>
        );
    }
    return menuItem;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex items-center justify-center">
         <Link href="/" className="flex items-center gap-2">
          <Logo className="h-10 w-auto"/>
        </Link>
      </div>
      <Separator className="bg-sidebar-border my-2" />
      <SidebarMenu className="flex-1 px-2 py-2 space-y-1">
        {publicNavItems.map(renderNavItem)}
        {commonUserNavItems.map(renderNavItem)}
        {generalInfoNavItems.map(renderNavItem)}
        {isAdmin && adminNavItems.map(renderNavItem)}
      </SidebarMenu>
      
      <div className="mt-auto">
        <Separator className="bg-sidebar-border my-2" />
        <SidebarMenu className="px-2 py-2 space-y-1">
            {authNavItems.map(renderNavItem)}
            {isAdmin && renderNavItem({ href: "#", label: "Admin Logout", icon: LogOut, action: adminLogout })}
            {isUserLoggedIn && !isAdmin && renderNavItem({ href: "#", label: "Logout", icon: LogOut, action: regularUserLogout })}
        </SidebarMenu>
      </div>
    </div>
  );
}
