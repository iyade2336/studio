import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
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

const mockDevices = [
  { id: "dev_001", name: "Living Room Sensor", owner: "Alice Wonderland", status: "online", lastSeen: "2023-10-26 10:00 AM", type: "DHT11/HW-038" },
  { id: "dev_002", name: "Kitchen Sensor", owner: "Bob The Builder", status: "offline", lastSeen: "2023-10-25 08:30 PM", type: "DHT11" },
  { id: "dev_003", name: "Basement Monitor", owner: "Charlie Brown", status: "online", lastSeen: "2023-10-26 10:05 AM", type: "HW-038" },
  { id: "dev_004", name: "Garage Sensor", owner: "Diana Prince", status: "warning", lastSeen: "2023-10-26 09:50 AM", type: "DHT11/HW-038" },
];

export default function AdminDevicesPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Manage Devices"
        description="View, edit, and manage all connected IoT devices."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Device
        </Button>
      </PageHeader>

      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search devices by ID, name, owner..."
            className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
          />
        </div>
        {/* Add filter dropdowns if needed */}
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
                    "secondary" // for warning or other statuses
                  } className={
                    device.status === "online" ? "bg-green-500 hover:bg-green-600" : 
                    device.status === "offline" ? "bg-red-500 hover:bg-red-600" : 
                    "bg-yellow-500 hover:bg-yellow-600"
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Delete Device</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Add Pagination component here if list is long */}
    </div>
  );
}
