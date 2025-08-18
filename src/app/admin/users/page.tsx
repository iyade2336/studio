
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
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";

export interface AdminUser {
  id: string; // This is the Supabase Auth UID
  first_name: string;
  last_name: string;
  email: string;
  whatsapp_number: string;
  company_name: string;
  subscription: keyof typeof PLAN_DETAILS; 
  allowed_devices: number; 
  joined_date: string; 
  avatar_url?: string;
  status: 'pending' | 'active' | 'rejected';
  role: 'user' | 'admin';
  allow_bluetooth_control: boolean;
  allow_water_leak_config: boolean;
  subscription_expiry_date?: string; 
}


const fetchUsers = async (): Promise<AdminUser[]> => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw new Error(error.message);
    return data as AdminUser[];
};

const updateUser = async (userData: Partial<AdminUser>) => {
    const { id, ...updateData } = userData;
    const { error } = await supabase.from('users').update(updateData).eq('id', id);
    if (error) throw new Error(error.message);
};

const deleteUser = async (userId: string) => {
    // This is more complex in Supabase, involving deleting from auth.users
    // For the UI, we'll just delete from the users table and log a warning.
    console.warn("User deletion from Supabase Auth needs to be handled server-side or via admin privileges.");
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw new Error(error.message);
};


const subscriptionOptions = Object.keys(PLAN_DETAILS) as Array<keyof typeof PLAN_DETAILS>;
const statusOptions: AdminUser["status"][] = ["pending", "active", "rejected"];
const roleOptions: AdminUser["role"][] = ["user", "admin"];

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

  const updateUserMutation = useMutation({
      mutationFn: updateUser,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['users']});
          toast({ title: "User Updated", description: "User has been updated successfully."});
          setIsUserModalOpen(false);
      },
      onError: (error) => {
          toast({ title: "Update Error", description: error.message, variant: "destructive" });
      }
  });

  const deleteUserMutation = useMutation({
      mutationFn: deleteUser,
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['users']});
          toast({ title: "User Deleted", description: "User has been removed."});
      },
      onError: (error) => {
          toast({ title: "Delete Error", description: error.message, variant: "destructive" });
      }
  });


  const handleOpenUserModal = (userToEdit?: AdminUser) => {
    if (userToEdit) {
      setCurrentUserData(userToEdit);
      setEditingUserId(userToEdit.id);
    } else {
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
        allowed_devices: planDetails?.maxDevices ?? prev?.allowed_devices ?? 0,
    }));
  };
  
  const handleSaveUser = async () => { 
    if (!editingUserId || !currentUserData) return;
    updateUserMutation.mutate(currentUserData);
  };
  
  const handleDeleteUser = async (userId: string) => {
    deleteUserMutation.mutate(userId);
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
    
    userContext.addNotification(`Admin message for ${notificationTargetUser.first_name}: ${notificationMessage}`, 'admin');

    toast({ title: "Notification Sent", description: `Message sent to ${notificationTargetUser.first_name} ${notificationTargetUser.last_name}.` });
    setIsNotificationModalOpen(false);
    setNotificationTargetUser(null);
    setNotificationMessage("");
  };


  const filteredUsers = users?.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company_name.toLowerCase().includes(searchTerm.toLowerCase())
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
    const headers = ["ID", "First Name", "Last Name", "Email", "WhatsApp", "Company", "Role", "Subscription", "Allowed Devices", "Joined Date", "Status", "Expiry Date", "Bluetooth Feature", "Water Leak Feature"];
    const csvRows = [
        headers.join(','),
        ...filteredUsers.map(u => [
            u.id,
            u.first_name,
            u.last_name,
            u.email,
            u.whatsapp_number,
            u.company_name,
            u.role,
            u.subscription,
            u.allowed_devices,
            u.joined_date ? new Date(u.joined_date).toLocaleDateString() : 'N/A',
            u.status,
            u.subscription_expiry_date ? new Date(u.subscription_expiry_date).toLocaleDateString() : 'N/A',
            u.allow_bluetooth_control,
            u.allow_water_leak_config
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
        description="View, edit, and manage all registered users from Supabase."
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
              <TableHead>Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUsers && [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
            ))}
            {!isLoadingUsers && filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} alt={`${user.first_name} ${user.last_name}`} data-ai-hint="person avatar" />
                      <AvatarFallback>{user.first_name?.substring(0, 1)}{user.last_name?.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{user.first_name} {user.last_name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                    <Badge variant={user.role === 'admin' ? "destructive" : "secondary"}>
                        {user.role}
                    </Badge>
                </TableCell>
                <TableCell>{user.company_name}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell>
                  <Badge variant={user.subscription === "Premium" || user.subscription === "Enterprise" ? "default" : "secondary"}>
                    {user.subscription}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(user.joined_date).toLocaleDateString()}</TableCell>
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
                <TableCell colSpan={7} className="h-24 text-center">
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
              {editingUserId ? "Update the user's details. Changes will be saved to Supabase." : "Fill in the details for the new user."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">First Name</Label>
              <Input id="firstName" value={currentUserData.first_name || ""} onChange={(e) => setCurrentUserData({ ...currentUserData, first_name: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">Last Name</Label>
              <Input id="lastName" value={currentUserData.last_name || ""} onChange={(e) => setCurrentUserData({ ...currentUserData, last_name: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" value={currentUserData.email || ""} disabled className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">Role</Label>
              <Select 
                value={currentUserData.role || "user"} 
                onValueChange={(value) => setCurrentUserData({ ...currentUserData, role: value as AdminUser['role'] })}
              >
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roleOptions.map(option => <SelectItem key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
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
                <Input id="allowedDevices" type="number" value={currentUserData.allowed_devices || 0} onChange={(e) => setCurrentUserData({...currentUserData, allowed_devices: parseInt(e.target.value) || 0})} className="col-span-3"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subscriptionExpiryDate" className="text-right">Expiry Date</Label>
                <Input 
                    id="subscriptionExpiryDate" 
                    type="date" 
                    value={currentUserData.subscription_expiry_date ? currentUserData.subscription_expiry_date.split('T')[0] : ''} 
                    onChange={(e) => setCurrentUserData({...currentUserData, subscription_expiry_date: e.target.value ? new Date(e.target.value).toISOString() : undefined})} 
                    className="col-span-3"
                />
            </div>
             <div className="col-span-4 space-y-2 border-t pt-4 mt-2">
                <Label className="font-semibold text-base">Feature Flags:</Label>
                 <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="allowBluetoothControlFeatures" 
                        checked={currentUserData.allow_bluetooth_control || false}
                        onCheckedChange={(checked) => setCurrentUserData({...currentUserData, allow_bluetooth_control: !!checked})}
                    />
                    <Label htmlFor="allowBluetoothControlFeatures" className="flex items-center gap-1 text-sm font-normal"><Bluetooth className="h-4 w-4"/> Allow Bluetooth Control Features</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox 
                        id="allowWaterLeakConfigFeatures" 
                        checked={currentUserData.allow_water_leak_config || false}
                        onCheckedChange={(checked) => setCurrentUserData({...currentUserData, allow_water_leak_config: !!checked})}
                    />
                    <Label htmlFor="allowWaterLeakConfigFeatures" className="flex items-center gap-1 text-sm font-normal"><Droplets className="h-4 w-4"/> Allow Water Leak Config Features</Label>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUser} disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Notification to {notificationTargetUser?.first_name}</DialogTitle>
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
