
"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Search, UserCheck, UserCog, UserPlus, CheckCircle, Clock, Trash2, Edit3, BellPlus } from "lucide-react";
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
import { useUser, type User as AppUser, PLAN_DETAILS } from "@/context/user-context"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const subscriptionOptions = Object.keys(PLAN_DETAILS);

export default function AdminUsersPage() {
  const { toast } = useToast();
  const { getAllUsers, approveUser, updateUserSubscription } = useUser();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('None');

  useEffect(() => {
    // Fetch users from our local context
    setUsers(getAllUsers());
    setIsLoading(false);
  }, [getAllUsers]);

  const handleApproveUser = (email: string) => {
    approveUser(email);
    setUsers(getAllUsers()); // Refresh the user list
    toast({ title: "User Approved", description: `User ${email} has been approved and granted a Premium trial.` });
  };

  const handleOpenSubscriptionModal = (user: AppUser) => {
    setSelectedUser(user);
    setSelectedPlan(user.subscription.planName);
    setIsModalOpen(true);
  };
  
  const handleSaveSubscription = () => {
    if (selectedUser) {
        updateUserSubscription(selectedUser.email, selectedPlan);
        setUsers(getAllUsers()); // Refresh user list
        toast({ title: "Subscription Updated", description: `User ${selectedUser.email} is now on the ${selectedPlan} plan.`});
    }
    setIsModalOpen(false);
    setSelectedUser(null);
  }

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Manage Users"
        description="Approve new users and manage their subscription plans."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12"/> : totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Skeleton className="h-8 w-12"/> : pendingUsers}</div>
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
              <TableHead>Company</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell colSpan={5}><Skeleton className="h-10 w-full" /></TableCell>
                </TableRow>
            ))}
            {!isLoading && filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                       <AvatarFallback>{user.first_name?.substring(0, 1)}{user.last_name?.substring(0,1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium">{user.first_name} {user.last_name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.company_name}</TableCell>
                <TableCell>
                  <Badge variant={user.subscription.planName === "Premium" || user.subscription.planName === "Enterprise" ? "default" : "secondary"}>
                    {user.subscription.planName}
                  </Badge>
                </TableCell>
                <TableCell>
                    <Badge variant={user.status === 'active' ? "default" : "destructive"} className={user.status === 'active' ? 'bg-green-500' : ''}>
                        {user.status}
                    </Badge>
                </TableCell>
                <TableCell className="text-right">
                    {user.status === 'pending' && (
                        <Button variant="outline" size="sm" onClick={() => handleApproveUser(user.email)} className="mr-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white">
                            <UserCheck className="mr-2 h-4 w-4"/> Approve
                        </Button>
                    )}
                     <Button variant="ghost" size="sm" onClick={() => handleOpenSubscriptionModal(user)}>
                        <Edit3 className="mr-2 h-4 w-4"/> Manage Plan
                    </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Manage Subscription for {selectedUser?.email}</DialogTitle>
            <DialogDescription>
                Select a new plan for the user. This will be effective immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subscription" className="text-right">Subscription Plan</Label>
                 <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select plan" /></SelectTrigger>
                    <SelectContent>
                        {subscriptionOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSubscription}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
