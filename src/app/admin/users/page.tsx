
"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit3, Trash2, CheckCircle, XCircle, Clock, BellPlus, Bluetooth, Droplets } from "lucide-react";
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
  DialogTrigger,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/user-context"; // For addNotification
import { PLAN_DETAILS } from "@/context/user-context";

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  whatsappNumber: string;
  companyName: string;
  subscription: keyof typeof PLAN_DETAILS; // Ensure this uses keys from PLAN_DETAILS
  devices: number; // This is current actual connected devices - will be updated by a separate mechanism
  allowedDevices: number; // Max devices admin sets for this user
  joinedDate: string; // format YYYY-MM-DD
  avatarUrl?: string;
  status: 'pending' | 'active' | 'rejected';
  passwordHash?: string;
  allowBluetoothControlFeatures: boolean;
  allowWaterLeakConfigFeatures: boolean;
  subscriptionExpiryDate?: string; // ISO String
}

const initialMockUsers: AdminUser[] = [
  { id: "usr_001", firstName: "Alice", lastName: "Wonderland", email: "alice@example.com", whatsappNumber: "+11234567890", companyName: "Wonderland Inc.", subscription: "Premium", devices: 2, allowedDevices: 3, joinedDate: "2023-01-15", avatarUrl: "https://picsum.photos/seed/alice/40/40", status: "active", passwordHash: "password123", allowBluetoothControlFeatures: true, allowWaterLeakConfigFeatures: true, subscriptionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "usr_002", firstName: "Bob", lastName: "Builder", email: "bob@example.com", whatsappNumber: "+12345678901", companyName: "Builders Co.", subscription: "Basic", devices: 1, allowedDevices: 1, joinedDate: "2023-03-20", avatarUrl: "https://picsum.photos/seed/bob/40/40", status: "active", passwordHash: "password123", allowBluetoothControlFeatures: false, allowWaterLeakConfigFeatures: false, subscriptionExpiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()},
  { id: "usr_003", firstName: "Charlie", lastName: "Brown", email: "charlie@example.com", whatsappNumber: "+13456789012", companyName: "Peanuts LLC", subscription: "None", devices: 0, allowedDevices: 0, joinedDate: "2022-11-01", avatarUrl: "https://picsum.photos/seed/charlie/40/40", status: "pending", passwordHash: "password123", allowBluetoothControlFeatures: false, allowWaterLeakConfigFeatures: false },
];

const defaultNewAdminCreatedUser: Omit<AdminUser, 'id' | 'joinedDate' | 'avatarUrl' | 'devices'> = {
  firstName: "",
  lastName: "",
  email: "",
  whatsappNumber: "",
  companyName: "",
  subscription: "None",
  allowedDevices: 0,
  status: "pending", 
  allowBluetoothControlFeatures: false,
  allowWaterLeakConfigFeatures: false,
};

const subscriptionOptions = Object.keys(PLAN_DETAILS) as Array<keyof typeof PLAN_DETAILS>;
const statusOptions: AdminUser["status"][] = ["pending", "active", "rejected"];

const LOCAL_STORAGE_KEY = "iot-guardian-users";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationTargetUser, setNotificationTargetUser] = useState<AdminUser | null>(null);
  const [currentUserData, setCurrentUserData] = useState<Partial<AdminUser>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const userContext = useUser(); // Get user context for addNotification

  useEffect(() => {
    const storedUsers = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(initialMockUsers);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialMockUsers));
    }
  }, []);

  const saveUsersToLocalStorage = (updatedUsers: AdminUser[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleOpenUserModal = (userToEdit?: AdminUser) => {
    if (userToEdit) {
      setCurrentUserData(userToEdit);
      setEditingUserId(userToEdit.id);
    } else {
      const defaultPlan = "None" as keyof typeof PLAN_DETAILS;
      setCurrentUserData({
        ...defaultNewAdminCreatedUser,
        subscription: defaultPlan,
        allowedDevices: PLAN_DETAILS[defaultPlan]?.maxDevices || 0,
        joinedDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
        avatarUrl: `https://picsum.photos/seed/${Date.now()}/40/40`,
      });
      setEditingUserId(null);
    }
    setIsUserModalOpen(true);
  };

  const handleSubscriptionChange = (newPlan: keyof typeof PLAN_DETAILS) => {
    const planDetails = PLAN_DETAILS[newPlan];
    setCurrentUserData(prev => ({
        ...prev,
        subscription: newPlan,
        allowedDevices: planDetails?.maxDevices ?? prev?.allowedDevices ?? 0,
        // Optionally reset feature flags based on plan, or let admin explicitly set them
        // allowBluetoothControlFeatures: planDetails?.canControlDevice ?? false, // Example logic
        // allowWaterLeakConfigFeatures: planDetails?.hasAutoShutdownFeature ?? false, // Example logic
    }));
  };
  
  const handleSaveUser = () => {
    if (!currentUserData.firstName || !currentUserData.lastName || !currentUserData.email) {
      toast({ title: "Error", description: "First Name, Last Name, and Email are required.", variant: "destructive" });
      return;
    }
     if (!currentUserData.subscription) {
      toast({ title: "Error", description: "Subscription plan is required.", variant: "destructive" });
      return;
    }
    
    let updatedUsers;
    const planDetails = PLAN_DETAILS[currentUserData.subscription];
    const subscriptionExpiry = currentUserData.subscriptionExpiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();


    if (editingUserId) { 
      updatedUsers = users.map(user => 
        user.id === editingUserId 
        ? { 
            ...user, 
            ...currentUserData,
            allowedDevices: currentUserData.allowedDevices ?? planDetails?.maxDevices ?? user.allowedDevices,
            subscriptionExpiryDate: subscriptionExpiry,
          } as AdminUser 
        : user
      );
      toast({ title: "User Updated", description: `User ${currentUserData.firstName} ${currentUserData.lastName} has been updated.` });
    } else { 
      const newUser: AdminUser = {
        id: `usr_${Date.now()}`,
        ...defaultNewAdminCreatedUser, 
        ...currentUserData,
        devices: 0, // New users start with 0 actual devices
        allowedDevices: currentUserData.allowedDevices ?? planDetails?.maxDevices ?? 0,
        joinedDate: currentUserData.joinedDate || new Date().toLocaleDateString('en-CA'),
        avatarUrl: currentUserData.avatarUrl || `https://picsum.photos/seed/${Date.now()}/40/40`,
        subscriptionExpiryDate: subscriptionExpiry,
      } as AdminUser;
      updatedUsers = [newUser, ...users];
      toast({ title: "User Added", description: `User ${newUser.firstName} ${newUser.lastName} has been added.` });
    }
    saveUsersToLocalStorage(updatedUsers);
    setIsUserModalOpen(false);
    setCurrentUserData({});
    setEditingUserId(null);
  };
  
  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    saveUsersToLocalStorage(updatedUsers);
    toast({ title: "User Deleted", description: "The user has been removed.", variant: "destructive" });
  }

  const handleOpenNotificationModal = (user: AdminUser) => {
    setNotificationTargetUser(user);
    setNotificationMessage("");
    setIsNotificationModalOpen(true);
  };

  const handleSendNotification = () => {
    if (!notificationTargetUser || !notificationMessage.trim()) {
      toast({ title: "Error", description: "User and message are required.", variant: "destructive" });
      return;
    }
    // This is a conceptual simulation. In a real app, this would send a notification
    // to the specific user via a backend service (e.g., WebSockets, push notifications).
    // For this demo, we'll use the shared UserContext's addNotification if the admin
    // is also the current user viewing (which isn't typical but works for demo).
    // A more robust solution would be a backend that stores notifications per user.
    
    console.log(`Admin sending notification to ${notificationTargetUser.email}: ${notificationMessage}`);
    // Simulate adding to a global notification pool that the target user might see
    // This is a simplified approach for demo.
    userContext.addNotification(`Admin message for ${notificationTargetUser.firstName}: ${notificationMessage}`, 'admin');

    toast({ title: "Notification Sent", description: `Message sent to ${notificationTargetUser.firstName} ${notificationTargetUser.lastName}.` });
    setIsNotificationModalOpen(false);
    setNotificationTargetUser(null);
    setNotificationMessage("");
  };


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
              <TableHead className="text-center">Allowed Devices</TableHead>
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
                  <Badge variant={user.subscription === "Premium" || user.subscription === "Enterprise" ? "default" : "secondary"}>
                    {user.subscription}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{user.allowedDevices}</TableCell>
                <TableCell>{new Date(user.joinedDate).toLocaleDateString()}</TableCell>
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
                       <DropdownMenuItem onClick={() => handleOpenNotificationModal(user)}>
                        <BellPlus className="mr-2 h-4 w-4" /> Send Notification
                      </DropdownMenuItem>
                      {user.status === 'pending' && (
                        <>
                          <DropdownMenuItem onClick={() => {
                            const defaultPlanOnApprove = "Basic" as keyof typeof PLAN_DETAILS;
                            handleSaveUser({ 
                              ...user, 
                              status: 'active', 
                              subscription: user.subscription === 'None' ? defaultPlanOnApprove : user.subscription,
                              allowedDevices: PLAN_DETAILS[user.subscription === 'None' ? defaultPlanOnApprove : user.subscription]?.maxDevices ?? 1,
                              subscriptionExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default 30 days
                            })
                          }}>
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
              <Label htmlFor="password" className="text-right">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder={editingUserId ? "Leave blank to keep current" : "Set password"}
                onChange={(e) => setCurrentUserData({ ...currentUserData, passwordHash: e.target.value })} 
                className="col-span-3" 
              />
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
              <Select 
                value={currentUserData.subscription || "None"} 
                onValueChange={(value) => handleSubscriptionChange(value as keyof typeof PLAN_DETAILS)}
              >
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select subscription" /></SelectTrigger>
                <SelectContent>
                  {subscriptionOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="allowedDevices" className="text-right">Allowed Devices</Label>
                <Input id="allowedDevices" type="number" value={currentUserData.allowedDevices || 0} onChange={(e) => setCurrentUserData({...currentUserData, allowedDevices: parseInt(e.target.value) || 0})} className="col-span-3"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subscriptionExpiryDate" className="text-right">Expiry Date</Label>
                <Input 
                    id="subscriptionExpiryDate" 
                    type="date" 
                    value={currentUserData.subscriptionExpiryDate ? currentUserData.subscriptionExpiryDate.split('T')[0] : ''} 
                    onChange={(e) => setCurrentUserData({...currentUserData, subscriptionExpiryDate: e.target.value ? new Date(e.target.value).toISOString() : undefined})} 
                    className="col-span-3"
                />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatarUrl" className="text-right">Avatar URL</Label>
              <Input id="avatarUrl" value={currentUserData.avatarUrl || ""} onChange={(e) => setCurrentUserData({ ...currentUserData, avatarUrl: e.target.value })} className="col-span-3" placeholder="Optional image URL" />
            </div>
             <div className="col-span-4 space-y-2 border-t pt-4 mt-2">
                <Label className="font-semibold text-base">Feature Flags:</Label>
                 <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="allowBluetoothControlFeatures" 
                        checked={currentUserData.allowBluetoothControlFeatures || false}
                        onCheckedChange={(checked) => setCurrentUserData({...currentUserData, allowBluetoothControlFeatures: !!checked})}
                    />
                    <Label htmlFor="allowBluetoothControlFeatures" className="flex items-center gap-1 text-sm font-normal"><Bluetooth className="h-4 w-4"/> Allow Bluetooth Control Features</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="allowWaterLeakConfigFeatures" 
                        checked={currentUserData.allowWaterLeakConfigFeatures || false}
                        onCheckedChange={(checked) => setCurrentUserData({...currentUserData, allowWaterLeakConfigFeatures: !!checked})}
                    />
                    <Label htmlFor="allowWaterLeakConfigFeatures" className="flex items-center gap-1 text-sm font-normal"><Droplets className="h-4 w-4"/> Allow Water Leak Config Features</Label>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUser}>Save User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Modal */}
      <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Notification to {notificationTargetUser?.firstName}</DialogTitle>
            <DialogDescription>
              Type your message below. It will appear in the user's notification panel.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 items-center gap-4">
              <Label htmlFor="notificationMessage" className="sr-only">
                Message
              </Label>
              <Textarea
                id="notificationMessage"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Enter your notification message here..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotificationModalOpen(false)}>Cancel</Button>
            <Button type="button" onClick={handleSendNotification}>Send Notification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
