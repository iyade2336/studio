import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, HardDrive, ShieldQuestion, BarChart3 } from "lucide-react";

const adminStats = [
  { title: "Total Users", value: "1,234", icon: Users, color: "text-blue-500", href: "/admin/users" },
  { title: "Active Devices", value: "876", icon: HardDrive, color: "text-green-500", href: "/admin/devices" },
  { title: "Reported Issues", value: "56", icon: ShieldQuestion, color: "text-red-500", href: "/admin/manage-issues" },
  { title: "System Health", value: "99.8%", icon: BarChart3, color: "text-teal-500", href: "#" },
];

export default function AdminDashboardPage() {
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
