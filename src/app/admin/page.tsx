
"use client";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, HardDrive, ShieldQuestion, BarChart3, Loader2, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const fetchUsersCount = async () => {
  const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
};

const fetchActiveDevicesCount = async () => {
  const { count, error } = await supabase.from('devices').select('*', { count: 'exact', head: true }).eq('status', 'online');
  if (error) throw new Error(error.message);
  return count ?? 0;
};

const fetchErrorReportsCount = async () => {
    const { count, error } = await supabase.from('error_reports').select('*', { count: 'exact', head: true });
    if (error) throw new Error(error.message);
    return count ?? 0;
};


export default function AdminDashboardPage() {
    const { data: usersCount, isLoading: isLoadingUsers } = useQuery({ queryKey: ['usersCount'], queryFn: fetchUsersCount });
    const { data: activeDevicesCount, isLoading: isLoadingDevices } = useQuery({ queryKey: ['activeDevicesCount'], queryFn: fetchActiveDevicesCount });
    const { data: errorReportsCount, isLoading: isLoadingErrors } = useQuery({ queryKey: ['errorReportsCount'], queryFn: fetchErrorReportsCount });

    const isLoading = isLoadingUsers || isLoadingDevices || isLoadingErrors;

  const adminStats = [
    { title: "Total Users", value: isLoadingUsers ? <Loader2 className="h-5 w-5 animate-spin"/> : usersCount, icon: Users, color: "text-blue-500", href: "/admin/users" },
    { title: "Active Devices", value: isLoadingDevices ? <Loader2 className="h-5 w-5 animate-spin"/> : activeDevicesCount, icon: HardDrive, color: "text-green-500", href: "/admin/devices" },
    { title: "Reported Errors", value: isLoadingErrors ? <Loader2 className="h-5 w-5 animate-spin"/> : errorReportsCount, icon: AlertTriangle, color: "text-red-500", href: "#" },
    { title: "System Health", value: "99.8%", icon: BarChart3, color: "text-teal-500", href: "#" },
  ];


  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Manage users, devices, and system settings for IoT Guardian."
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat) => (
          <Card key={stat.title} className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <Link href={stat.href} className="text-xs text-muted-foreground hover:text-primary">
                View details &rarr;
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Management</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button variant="outline" size="lg" className="w-full justify-start text-base" asChild>
            <Link href="/admin/users"><Users className="mr-3 h-5 w-5"/> Manage Users</Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full justify-start text-base" asChild>
            <Link href="/admin/devices"><HardDrive className="mr-3 h-5 w-5"/> Manage Devices</Link>
          </Button>
          <Button variant="outline" size="lg" className="w-full justify-start text-base" asChild>
            <Link href="/admin/manage-issues"><ShieldQuestion className="mr-3 h-5 w-5"/> Manage Issues</Link>
          </Button>
        </CardContent>
      </Card>
      {/* Placeholder for more admin specific components, e.g., charts, recent activity */}
    </div>
  );
}
