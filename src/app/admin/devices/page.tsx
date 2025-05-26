
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

const mockDevices = [
  { id: "dev_001", name: "Living Room Sensor", owner: "Alice Wonderland", status: "online", lastSeen: "2023-10-26 10:00 AM", type: "DHT11/HW-038" },
  { id: "dev_002", name: "Kitchen Sensor", owner: "Bob The Builder", status: "offline", lastSeen: "2023-10-25 08:30 PM", type: "DHT11" },
  { id: "dev_003", name: "Basement Monitor", owner: "Charlie Brown", status: "online", lastSeen: "2023-10-26 10:05 AM", type: "HW-038" },
  { id: "dev_004", name: "Garage Sensor", owner: "Diana Prince", status: "warning", lastSeen: "2023-10-26 09:50 AM", type: "DHT11/HW-038" },
  { id: "esp32-001", name: "ESP32 Test Device", owner: "Demo User", status: "online", lastSeen: new Date().toLocaleTimeString(), type: "ESP32 + Sensors"},
];

export default function AdminDevicesPage() {
  const { toast } = useToast();

  const downloadDevicesCSV = () => {
    const headers = ["Device ID", "Name", "Owner", "Status", "Last Seen", "Type"];
    const csvRows = [
        headers.join(','),
        ...mockDevices.map(d => [
            d.id,
            d.name,
            d.owner,
            d.status,
            d.lastSeen,
            d.type
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

  const totalDevices = mockDevices.length;
  const onlineDevices = mockDevices.filter(d => d.status === "online").length;
  const offlineDevices = mockDevices.filter(d => d.status === "offline").length;


  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Manage Devices"
        description="View, edit, and manage all connected IoT devices."
      >
        <div className="flex gap-2">
          <Button onClick={downloadDevicesCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Download CSV
          </Button>
          <Button>
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
            <div className="text-2xl font-bold">{totalDevices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineDevices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Devices</CardTitle>
            <WifiOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offlineDevices}</div>
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
            {mockDevices.map((device) => (
              <TableRow key={device.id}>
                <TableCell className="font-medium">{device.id}</TableCell>
                <TableCell>{device.name}</TableCell>
                <TableCell>{device.owner}</TableCell>
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
                <TableCell>{device.lastSeen}</TableCell>
                <TableCell>{device.type}</TableCell>
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
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

