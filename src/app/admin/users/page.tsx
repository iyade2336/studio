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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

const mockUsers = [
  { id: "usr_001", name: "Alice Wonderland", email: "alice@example.com", subscription: "Premium", devices: 3, joinedDate: "2023-01-15", avatarUrl: "https://picsum.photos/seed/alice/40/40" },
  { id: "usr_002", name: "Bob The Builder", email: "bob@example.com", subscription: "Basic", devices: 1, joinedDate: "2023-03-20", avatarUrl: "https://picsum.photos/seed/bob/40/40" },
  { id: "usr_003", name: "Charlie Brown", email: "charlie@example.com", subscription: "Premium", devices: 5, joinedDate: "2022-11-01", avatarUrl: "https://picsum.photos/seed/charlie/40/40" },
  { id: "usr_004", name: "Diana Prince", email: "diana@example.com", subscription: "Free Trial", devices: 0, joinedDate: "2023-10-20", avatarUrl: "https://picsum.photos/seed/diana/40/40" },
];

export default function AdminUsersPage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Manage Users"
        description="View, edit, and manage all registered users."
      >
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </PageHeader>

       <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users by name, email..."
            className="w-full rounded-lg bg-background pl-8 md:w-[300px] lg:w-[400px]"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead className="text-center">Devices</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person avatar" />
                      <AvatarFallback>{user.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.subscription === "Premium" ? "default" : "secondary"}>
                    {user.subscription}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{user.devices}</TableCell>
                <TableCell>{user.joinedDate}</TableCell>
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
                      <DropdownMenuItem>View Profile</DropdownMenuItem>
                      <DropdownMenuItem>Edit User</DropdownMenuItem>
                      <DropdownMenuItem>Manage Subscription</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Suspend User</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
       {/* Add Pagination component here */}
    </div>
  );
}
