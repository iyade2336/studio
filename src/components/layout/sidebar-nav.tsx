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
  type LucideIcon,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/icons/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import React from "react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  matchExact?: boolean;
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, matchExact: true },
  { href: "/troubleshoot", label: "AI Troubleshoot", icon: Bot },
  { href: "/issues", label: "Common Issues", icon: Wrench },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  {
    href: "/admin",
    label: "Admin",
    icon: Settings,
    subItems: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard, matchExact: true },
      { href: "/admin/devices", label: "Devices", icon: HardDrive },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/manage-issues", label: "Manage Issues", icon: ShieldQuestion },
    ],
  },
];

const authNavItems: NavItem[] = [
  { href: "/auth/login", label: "Login", icon: LogIn },
  { href: "/auth/register", label: "Register", icon: UserPlus },
];

export function SidebarNav() {
  const pathname = usePathname();

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const isActive = item.matchExact ? pathname === item.href : pathname.startsWith(item.href);
    const ButtonComponent = isSubItem ? SidebarMenuSubButton : SidebarMenuButton;
    const useAsChild = !isSubItem;

    const navItemContent = (
      <>
        <item.icon className="mr-2 h-5 w-5" />
        <span className="truncate">{item.label}</span>
      </>
    );
    
    return (
      <SidebarMenuItem key={item.href}>
        <Link href={item.href} passHref legacyBehavior>
          <ButtonComponent
            className={cn(isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", "w-full justify-start")}
            isActive={isActive}
            asChild={useAsChild}
            tooltip={item.label}
          >
            {useAsChild ? <a>{navItemContent}</a> : navItemContent}
          </ButtonComponent>
        </Link>
        {item.subItems && isActive && (
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
        {navItems.map(item => renderNavItem(item))}
      </SidebarMenu>
      <Separator className="bg-sidebar-border my-2" />
      <SidebarMenu className="px-2 py-2 space-y-1">
        {authNavItems.map(item => renderNavItem(item))}
      </SidebarMenu>
    </div>
  );
}