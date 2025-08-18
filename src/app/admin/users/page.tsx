
"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Edit3, Trash2, CheckCircle, XCircle, Clock, BellPlus, Bluetooth, Droplets, Download, UsersIcon, UserCheck, UserCog } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/user-context"; 
import { PLAN_DETAILS } from "@/context/user-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, query, doc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

export interface AdminUser {
  id: string; // This will be the Firestore document ID
  uid: string; // This is the Firebase Auth UID
  firstName: string;
  lastName: string;
  email: string;
  whatsappNumber: string;
  companyName: string;
  subscription: keyof typeof PLAN_DETAILS; 
  allowedDevices: number; 
  joinedDate: string; 
  avatarUrl?: string;
  status: 'pending' | 'active' | 'rejected';
  allowBluetoothControlFeatures: boolean;
  allowWaterLeakConfigFeatures: boolean;
  subscriptionExpiryDate?: string; 
}


const fetchUsers = async (): Promise<AdminUser[]> => {
    const usersRef = collection(db, "users");
    const usersQuery = query(usersRef);
    const querySnapshot = await getDocs(usersQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdminUser));
};


const subscriptionOptions = Object.keys(PLAN_DETAILS) as Array<keyof typeof PLAN_DETAILS>;
const statusOptions: AdminUser["status"][] = ["pending", "active", "rejected"];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationTargetUser, setNotificationTargetUser] = useState<AdminUser | null>(null);
  const [currentUserData, setCurrentUserData] = useState<Partial<AdminUser>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const userContext = useUser(); 

  const { data: users = [], isLoading: isLoadingUsers, refetch } = useQuery<AdminUser[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });


  const handleOpenUserModal = (userToEdit?: AdminUser) => {
    if (userToEdit) {
      setCurrentUserData(userToEdit);
      setEditingUserId(userToEdit.id);
    } else {
      // Logic for adding a new user from admin panel is complex with Auth.
      // For now, we focus on editing existing users who signed up.
      toast({ title: "Action Disabled", description: "Please have new users register through the registration form." });
      return;
    }
    setIsUserModalOpen(true);
  };

  const handleSubscriptionChange = (newPlan: keyof typeof PLAN_DETAILS) => {
    const planDetails = PLAN_DETAILS[newPlan];
    setCurrentUserData(prev => ({
        ...prev,
        subscription: newPlan,
        allowedDevices: planDetails?.maxDevices ?? prev?.allowedDevices ?? 0,
    }));
  };
  
  const handleSaveUser = async () => { 
    if (!editingUserId || !currentUserData) return;

    const userDocRef = doc(db, "users", editingUserId);
    
    try {
      const dataToUpdate: Partial<AdminUser> = { ...currentUserData };
      delete dataToUpdate.id; // Don't save the document id inside the document

      await updateDoc(userDocRef, dataToUpdate as any);
      
      refetch(); // Refetch the users list

      toast({ title: "User Updated", description: `User ${currentUserData.firstName} ${currentUserData.lastName} has been updated.` });
      setIsUserModalOpen(false);
      setCurrentUserData({});
      setEditingUserId(null);

    } catch (error) {
       console.error("Error updating user:", error);
       toast({ title: "Error", description: "Failed to update user.", variant: "destructive" });
    }
  };
  
  const handleDeleteUser = async (userId: string) => {
    // In a real app, this should also delete the user from Firebase Auth, which is a protected admin action.
    // For now, we will just delete the Firestore document.
    try {
      await deleteDoc(doc(db, "users", userId));
      refetch();
      toast({ title: "User Deleted", description: "The user has been removed from Firestore.", variant: "destructive" });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({ title: "Error", description: "Failed to delete user.", variant: "destructive" });
    }
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
    
    // In a real app, this would send a push notification or save to a 'notifications' subcollection for that user.
    // Here, we just use the local toast for demonstration.
    userContext.addNotification(`Admin message for ${notificationTargetUser.firstName}: ${notificationMessage}`, 'admin');

    toast({ title: "Notification Sent", description: `Message sent to ${notificationTargetUser.firstName} ${notificationTargetUser.lastName}.` });
    setIsNotificationModalOpen(false);
    setNotificationTargetUser(null);
    setNotificationMessage("");
  };


  const filteredUsers = users?.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: AdminUser['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600 text-primary-foreground"><CheckCircle className="mr-1 h-3 w-3"/>Active</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-primary-foreground"><Clock className="mr-1 h-3 w-3"/>Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const downloadUsersCSV = () => {
    if (!users) return;
    const headers = ["ID", "UID", "First Name", "Last Name", "Email", "WhatsApp", "Company", "Subscription", "Allowed Devices", "Joined Date", "Status", "Expiry Date", "Bluetooth Feature", "Water Leak Feature"];
    const csvRows = [
        headers.join(','),
        ...filteredUsers.map(u => [
            u.id,
            u.uid,
            u.firstName,
            u.lastName,
            u.email,
            u.whatsappNumber,
            u.companyName,
            u.subscription,
            u.allowedDevices,
            u.joinedDate ? new Date(u.joinedDate).toLocaleDateString() : 'N/A',
            u.status,
            u.subscriptionExpiryDate ? new Date(u.subscriptionExpiryDate).toLocaleDateString() : 'N/A',
            u.allowBluetoothControlFeatures,
            u.allowWaterLeakConfigFeatures
        ].join(','))
    ];
    const csvString = csvRows.join('\r\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `iot_guardian_users_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    toast({ title: "Users CSV Exported", description: "User data has been downloaded."});
  };

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(u => u.status === 'active').length || 0;
  const pendingUsers = users?.filter(u => u.status === 'pending').length || 0;

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Manage Users"
        description="View, edit, and manage all registered users from Firestore."
      >
        <div className="flex gap-2">
          <Button onClick={downloadUsersCSV} variant="outline" disabled={isLoadingUsers || users.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Download CSV
          </Button>
          <Button onClick={() => handleOpenUserModal()} disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingUsers ? <Skeleton className="h-8 w-12"/> : totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingUsers ? <Skeleton className="h-8 w-12"/> : activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingUsers ? <Skeleton className="h-8 w-12"/> : pendingUsers}</div>
          </CardContent>
        </Card>
      </div>


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
            {isLoadingUsers && [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell colSpan={8}><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
            ))}
            {!isLoadingUsers && filteredUsers.map((user) => (
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive hover:!bg-destructive/10 hover:!text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {!isLoadingUsers && filteredUsers.length === 0 && (
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
              {editingUserId ? "Update the user's details. Changes will be saved to Firestore." : "Fill in the details for the new user."}
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
              <Input id="email" type="email" value={currentUserData.email || ""} disabled className="col-span-3" />
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
              <Select 
                value={currentUserData.status || "pending"} 
                onValueChange={(value) => setCurrentUserData({ ...currentUserData, status: value as AdminUser['status'] })}
              >
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
            <Button onClick={handleSaveUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Notification to {notificationTargetUser?.firstName}</DialogTitle>
            <DialogDescription>
              Type your message below. This is a demo and will show as a local toast.
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


    