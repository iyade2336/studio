
"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Download, HardDrive, Wifi, WifiOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

interface Device {
  id: string; // Firestore document ID
  deviceId: string;
  name?: string;
  owner?: string;
  status: 'online' | 'offline' | 'warning' | 'danger';
  lastSeen: { seconds: number; nanoseconds: number; } | null;
  type?: string;
}

const fetchDevices = async (): Promise<Device[]> => {
  const devicesRef = collection(db, "devices");
  const querySnapshot = await getDocs(devicesRef);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Device));
};

export default function AdminDevicesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: devices = [], isLoading: isLoadingDevices, refetch } = useQuery<Device[]>({
    queryKey: ['adminDevices'],
    queryFn: fetchDevices,
  });

  const downloadDevicesCSV = () => {
    if (!devices || devices.length === 0) {
      toast({ title: "No data to export" });
      return;
    }
    const headers = ["Device ID", "Name", "Owner", "Status", "Last Seen", "Type"];
    const csvRows = [
        headers.join(','),
        ...filteredDevices.map(d => [
            d.deviceId,
            d.name || 'N/A',
            d.owner || 'N/A',
            d.status,
            d.lastSeen ? new Date(d.lastSeen.seconds * 1000).toLocaleString() : 'N/A',
            d.type || 'N/A'
        ].join(','))
    ];
    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `iot_guardian_devices_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    toast({ title: "Devices CSV Exported", description: "Device data has been downloaded."});
  };

  const filteredDevices = devices.filter(device => {
    const searchLower = searchTerm.toLowerCase();
    return (
      device.deviceId.toLowerCase().includes(searchLower) ||
      (device.name && device.name.toLowerCase().includes(searchLower)) ||
      (device.owner && device.owner.toLowerCase().includes(searchLower))
    );
  });

  const totalDevices = devices.length;
  const onlineDevices = devices.filter(d => d.status === "online").length;
  const offlineDevices = totalDevices - onlineDevices;


  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Manage Devices"
        description="View, edit, and manage all connected IoT devices."
      >
        <div className="flex gap-2">
          <Button onClick={downloadDevicesCSV} variant="outline" disabled={isLoadingDevices || devices.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Download CSV
          </Button>
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Device
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingDevices ? <Skeleton className="h-8 w-16" /> : totalDevices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingDevices ? <Skeleton className="h-8 w-16" /> : onlineDevices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Devices</CardTitle>
            <WifiOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingDevices ? <Skeleton className="h-8 w-16" /> : offlineDevices}</div>
          </CardContent>
        </Card>
      </div>


      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search devices by ID, name, owner..."
            className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Device ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Seen</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingDevices && [...Array(5)].map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                    <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
            ))}
            {!isLoadingDevices && filteredDevices.map((device) => (
              <TableRow key={device.id}>
                <TableCell className="font-medium">{device.deviceId}</TableCell>
                <TableCell>{device.name || 'N/A'}</TableCell>
                <TableCell>{device.owner || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={
                    device.status === "online" ? "default" : 
                    device.status === "offline" ? "destructive" : 
                    "secondary" 
                  } className={
                    device.status === "online" ? "bg-green-500 hover:bg-green-600 text-primary-foreground" : 
                    device.status === "offline" ? "bg-red-500 hover:bg-red-600 text-primary-foreground" : 
                    "bg-yellow-500 hover:bg-yellow-600 text-primary-foreground"
                  }>
                    {device.status}
                  </Badge>
                </TableCell>
                <TableCell>{device.lastSeen ? new Date(device.lastSeen.seconds * 1000).toLocaleString() : 'Never'}</TableCell>
                <TableCell>{device.type || 'Unknown'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Device</DropdownMenuItem>
                       <DropdownMenuItem>Send Command</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive hover:!text-destructive">Delete Device</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
             {!isLoadingDevices && filteredDevices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No devices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
