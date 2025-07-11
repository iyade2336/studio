
"use client";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, HardDrive, ShieldQuestion, BarChart3, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useEffect, useState } from "react";

const fetchUsersCount = async () => {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);
  return snapshot.size;
};

const fetchActiveDevicesCount = async () => {
  const devicesRef = collection(db, "devices");
  const q = query(devicesRef, where('status', '==', 'online'));
  const snapshot = await getDocs(q);
  return snapshot.size;
};


export default function AdminDashboardPage() {
    const [usersCount, setUsersCount] = useState(0);
    const [activeDevicesCount, setActiveDevicesCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const usersRef = collection(db, "users");
        const devicesRef = collection(db, 'devices');
        const activeDevicesQuery = query(devicesRef, where('status', '==', 'online'));

        const unsubUsers = onSnapshot(usersRef, (snapshot) => {
            setUsersCount(snapshot.size);
            if(isLoading) setIsLoading(false);
        });

        const unsubDevices = onSnapshot(activeDevicesQuery, (snapshot) => {
            setActiveDevicesCount(snapshot.size);
            if(isLoading) setIsLoading(false);
        });

        // Initial load check
        Promise.all([getDocs(usersRef), getDocs(activeDevicesQuery)]).then(() => {
            setIsLoading(false);
        }).catch(() => setIsLoading(false));

        return () => {
            unsubUsers();
            unsubDevices();
        };
    }, [isLoading]);

  const adminStats = [
    { title: "Total Users", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : usersCount, icon: Users, color: "text-blue-500", href: "/admin/users" },
    { title: "Active Devices", value: isLoading ? <Loader2 className="h-5 w-5 animate-spin"/> : activeDevicesCount, icon: HardDrive, color: "text-green-500", href: "/admin/devices" },
    { title: "Reported Issues", value: "56", icon: ShieldQuestion, color: "text-red-500", href: "/admin/manage-issues" },
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
