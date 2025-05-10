
"use client";
import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit3, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  subscription: "Premium" | "Basic" | "Free Trial" | string;
  devices: number;
  joinedDate: string;
  avatarUrl?: string;
}

const initialMockUsers: AdminUser[] = [
  { id: "usr_001", name: "Alice Wonderland", email: "alice@example.com", subscription: "Premium", devices: 3, joinedDate: "2023-01-15", avatarUrl: "https://picsum.photos/seed/alice/40/40" },
  { id: "usr_002", name: "Bob The Builder", email: "bob@example.com", subscription: "Basic", devices: 1, joinedDate: "2023-03-20", avatarUrl: "https://picsum.photos/seed/bob/40/40" },
  { id: "usr_003", name: "Charlie Brown", email: "charlie@example.com", subscription: "Premium", devices: 5, joinedDate: "2022-11-01", avatarUrl: "https://picsum.photos/seed/charlie/40/40" },
  { id: "usr_004", name: "Diana Prince", email: "diana@example.com", subscription: "Free Trial", devices: 0, joinedDate: "2023-10-20", avatarUrl: "https://picsum.photos/seed/diana/40/40" },
];

const defaultNewUser: Omit<AdminUser, 'id'> = {
  name: "",
  email: "",
  subscription: "Basic",
  devices: 0,
  joinedDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format
  avatarUrl: "",
};

const subscriptionOptions: AdminUser["subscription"][] = ["Basic", "Premium", "Free Trial"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(initialMockUsers);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<Partial<AdminUser>>(defaultNewUser);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleOpenUserModal = (userToEdit?: AdminUser) => {
    if (userToEdit) {
      setCurrentUserData(userToEdit);
      setEditingUserId(userToEdit.id);
    } else {
      setCurrentUserData({
        ...defaultNewUser,
         avatarUrl: `https://picsum.photos/seed/${Date.now()}/40/40`
      });
      setEditingUserId(null);
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!currentUserData.name || !currentUserData.email) {
      toast({ title: "Error", description: "Name and Email are required.", variant: "destructive" });
      return;
    }

    if (editingUserId) { // Editing existing user
      setUsers(users.map(user => user.id === editingUserId ? { ...user, ...currentUserData } as AdminUser : user));
      toast({ title: "User Updated", description: `User ${currentUserData.name} has been updated.` });
    } else { // Adding new user
      const newUser: AdminUser = {
        id: `usr_${Date.now()}`,
        ...defaultNewUser, // ensures all fields are present
        ...currentUserData,
        avatarUrl: currentUserData.avatarUrl || `https://picsum.photos/seed/${Date.now()}/40/40`,
      } as AdminUser;
      setUsers(prevUsers => [newUser, ...prevUsers]);
      toast({ title: "User Added", description: `User ${newUser.name} has been added.` });
    }
    setIsUserModalOpen(false);
    setCurrentUserData(defaultNewUser);
    setEditingUserId(null);
  };
  
  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    toast({ title: "User Deleted", description: "The user has been removed.", variant: "destructive" });
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Manage Users"
        description="View, edit, and manage all registered users."
      >
        <Button onClick={() => handleOpenUserModal()}>
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person avatar" />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
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
                      <DropdownMenuItem onClick={() => handleOpenUserModal(user)}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit User
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive hover:!bg-destructive/10 hover:!text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editingUserId ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUserId ? "Update the user's details." : "Fill in the details for the new user."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input
                id="name"
                value={currentUserData.name || ""}
                onChange={(e) => setCurrentUserData({ ...currentUserData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                value={currentUserData.email || ""}
                onChange={(e) => setCurrentUserData({ ...currentUserData, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subscription" className="text-right">Subscription</Label>
              <Select
                value={currentUserData.subscription || "Basic"}
                onValueChange={(value) => setCurrentUserData({ ...currentUserData, subscription: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select subscription" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatarUrl" className="text-right">Avatar URL</Label>
              <Input
                id="avatarUrl"
                value={currentUserData.avatarUrl || ""}
                onChange={(e) => setCurrentUserData({ ...currentUserData, avatarUrl: e.target.value })}
                className="col-span-3"
                placeholder="Optional image URL"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUser}>Save User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
