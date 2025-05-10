
"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit3, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
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

// Make AdminUser exportable if not already in a shared types file
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsappNumber: string;
  companyName: string;
  subscription: "Premium" | "Basic" | "Free Trial" | "None" | string;
  devices: number;
  joinedDate: string;
  avatarUrl?: string;
  status: 'pending' | 'active' | 'rejected';
  passwordHash?: string; // For local simulation of login. NEVER do this in production.
}

const initialMockUsers: AdminUser[] = [
  { id: "usr_001", firstName: "Alice", lastName: "Wonderland", email: "alice@example.com", whatsappNumber: "+11234567890", companyName: "Wonderland Inc.", subscription: "Premium", devices: 3, joinedDate: "2023-01-15", avatarUrl: "https://picsum.photos/seed/alice/40/40", status: "active", passwordHash: "password123" },
  { id: "usr_002", firstName: "Bob", lastName: "Builder", email: "bob@example.com", whatsappNumber: "+12345678901", companyName: "Builders Co.", subscription: "Basic", devices: 1, joinedDate: "2023-03-20", avatarUrl: "https://picsum.photos/seed/bob/40/40", status: "active", passwordHash: "password123" },
  { id: "usr_003", firstName: "Charlie", lastName: "Brown", email: "charlie@example.com", whatsappNumber: "+13456789012", companyName: "Peanuts LLC", subscription: "pending", devices: 0, joinedDate: "2022-11-01", avatarUrl: "https://picsum.photos/seed/charlie/40/40", status: "pending", passwordHash: "password123" },
];

const defaultNewAdminCreatedUser: Omit<AdminUser, 'id' | 'joinedDate' | 'avatarUrl'> = {
  firstName: "",
  lastName: "",
  email: "",
  whatsappNumber: "",
  companyName: "",
  subscription: "Basic",
  devices: 0,
  status: "active", // Admin-created users are active by default
};

const subscriptionOptions: AdminUser["subscription"][] = ["None", "Basic", "Premium", "Free Trial"];
const statusOptions: AdminUser["status"][] = ["pending", "active", "rejected"];

const LOCAL_STORAGE_KEY = "iot-guardian-users";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<Partial<AdminUser>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const storedUsers = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // If no users in localStorage, initialize with mock data
      setUsers(initialMockUsers);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialMockUsers));
    }
  }, []);

  const saveUsersToLocalStorage = (updatedUsers: AdminUser[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUsers));
  };

  const handleOpenUserModal = (userToEdit?: AdminUser) => {
    if (userToEdit) {
      setCurrentUserData(userToEdit);
      setEditingUserId(userToEdit.id);
    } else {
      setCurrentUserData({
        ...defaultNewAdminCreatedUser,
        joinedDate: new Date().toLocaleDateString('en-CA'),
        avatarUrl: `https://picsum.photos/seed/${Date.now()}/40/40`,
      });
      setEditingUserId(null);
    }
    setIsUserModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!currentUserData.firstName || !currentUserData.lastName || !currentUserData.email) {
      toast({ title: "Error", description: "First Name, Last Name, and Email are required.", variant: "destructive" });
      return;
    }
    
    let updatedUsers;
    if (editingUserId) { // Editing existing user
      updatedUsers = users.map(user => user.id === editingUserId ? { ...user, ...currentUserData } as AdminUser : user);
      toast({ title: "User Updated", description: `User ${currentUserData.firstName} ${currentUserData.lastName} has been updated.` });
    } else { // Adding new user (by admin)
      const newUser: AdminUser = {
        id: `usr_${Date.now()}`,
        ...defaultNewAdminCreatedUser, // ensures all fields are present
        ...currentUserData,
        joinedDate: currentUserData.joinedDate || new Date().toLocaleDateString('en-CA'),
        avatarUrl: currentUserData.avatarUrl || `https://picsum.photos/seed/${Date.now()}/40/40`,
      } as AdminUser;
      updatedUsers = [newUser, ...users];
      toast({ title: "User Added", description: `User ${newUser.firstName} ${newUser.lastName} has been added.` });
    }
    setUsers(updatedUsers);
    saveUsersToLocalStorage(updatedUsers);
    setIsUserModalOpen(false);
    setCurrentUserData({});
    setEditingUserId(null);
  };
  
  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    saveUsersToLocalStorage(updatedUsers);
    toast({ title: "User Deleted", description: "The user has been removed.", variant: "destructive" });
  }

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: AdminUser['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3"/>Active</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600"><Clock className="mr-1 h-3 w-3"/>Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };


  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Manage Users"
        description="View, edit, and manage all registered users, including pending approvals."
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
            placeholder="Search users by name, email, company..."
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
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead className="text-center">Devices</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} data-ai-hint="person avatar" />
                      <AvatarFallback>{user.firstName?.substring(0, 1)}{user.lastName?.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.firstName} {user.lastName}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.companyName}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
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
                      {user.status === 'pending' && (
                        <>
                          <DropdownMenuItem onClick={() => handleSaveUser({ ...user, status: 'active', subscription: user.subscription === 'None' ? 'Basic' : user.subscription })}>
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSaveUser({ ...user, status: 'rejected' })}>
                            <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                          </DropdownMenuItem>
                        </>
                      )}
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
                <TableCell colSpan={8} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingUserId ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {editingUserId ? "Update the user's details." : "Fill in the details for the new user."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">First Name</Label>
              <Input id="firstName" value={currentUserData.firstName || ""} onChange={(e) => setCurrentUserData({ ...currentUserData, firstName: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">Last Name</Label>
              <Input id="lastName" value={currentUserData.lastName || ""} onChange={(e) => setCurrentUserData({ ...currentUserData, lastName: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" value={currentUserData.email || ""} onChange={(e) => setCurrentUserData({ ...currentUserData, email: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="whatsappNumber" className="text-right">WhatsApp</Label>
              <Input id="whatsappNumber" value={currentUserData.whatsappNumber || ""} onChange={(e) => setCurrentUserData({ ...currentUserData, whatsappNumber: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyName" className="text-right">Company</Label>
              <Input id="companyName" value={currentUserData.companyName || ""} onChange={(e) => setCurrentUserData({ ...currentUserData, companyName: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select value={currentUserData.status || "pending"} onValueChange={(value) => setCurrentUserData({ ...currentUserData, status: value as AdminUser['status'] })}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => <SelectItem key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subscription" className="text-right">Subscription</Label>
              <Select value={currentUserData.subscription || "None"} onValueChange={(value) => setCurrentUserData({ ...currentUserData, subscription: value })}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select subscription" /></SelectTrigger>
                <SelectContent>
                  {subscriptionOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="devices" className="text-right">Devices</Label>
              <Input id="devices" type="number" value={currentUserData.devices || 0} onChange={(e) => setCurrentUserData({ ...currentUserData, devices: parseInt(e.target.value) || 0 })} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatarUrl" className="text-right">Avatar URL</Label>
              <Input id="avatarUrl" value={currentUserData.avatarUrl || ""} onChange={(e) => setCurrentUserData({ ...currentUserData, avatarUrl: e.target.value })} className="col-span-3" placeholder="Optional image URL" />
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
