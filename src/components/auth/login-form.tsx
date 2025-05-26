
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription as CardDesc, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"; // Renamed CardDescription to CardDesc
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/context/user-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import type { AdminUser } from "@/app/admin/users/page";
import { useAdminAuth } from '@/context/admin-auth-context';

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";
const ADMIN_TOKEN = "iyade";
const LOCAL_STORAGE_KEY_USERS = "iot-guardian-users";

const formSchema = z.object({
  email: z.string().min(1, { message: "Username or Email is required." }),
  password: z.string().min(1, { message: "Password is required." }),
  adminToken: z.string().optional(),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useUser();
  const adminAuth = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      adminToken: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call

    if (values.email === ADMIN_USERNAME && values.password === ADMIN_PASSWORD) {
      // Admin login attempt
      if (values.adminToken === ADMIN_TOKEN) {
        const adminLoginSuccess = adminAuth.login(values.email, values.password);
        if (adminLoginSuccess) {
          toast({ title: "Admin Login Successful", description: "Redirecting to admin dashboard..." });
          router.push('/admin');
          // No need to setIsLoading(false) as router.push will unmount
        } else {
          // This case should ideally not happen if credentials are correct in context
          toast({ title: "Admin Login Failed", description: "An unexpected error occurred with admin authentication.", variant: "destructive" });
          setIsLoading(false);
        }
      } else {
        toast({ title: "Admin Login Failed", description: "Invalid or missing admin token for admin user.", variant: "destructive" });
        setIsLoading(false);
      }
    } else {
      // Regular user login attempt
      try {
        const usersString = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
        const users: AdminUser[] = usersString ? JSON.parse(usersString) : [];
        const foundUser = users.find(user => user.email === values.email);

        if (!foundUser) {
          toast({ title: "Login Failed", description: "User not found.", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        if (foundUser.passwordHash !== values.password) {
          toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        if (foundUser.status === 'pending') {
          toast({ title: "Login Pending", description: "Your account is awaiting admin approval.", variant: "default" });
          setIsLoading(false);
          return;
        }

        if (foundUser.status === 'rejected') {
          toast({ title: "Login Failed", description: "Your account registration has been rejected.", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        if (foundUser.status === 'active') {
          loginUser({
            id: foundUser.id,
            name: `${foundUser.firstName} ${foundUser.lastName}`,
            email: foundUser.email,
            isLoggedIn: true,
            subscription: {
              planName: foundUser.subscription,
              expiryDate: foundUser.subscriptionExpiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              maxDevices: foundUser.allowedDevices,
              canControlDevice: foundUser.allowBluetoothControlFeatures, // Assuming this is a direct mapping for now
              canExportCsv: true, // Example, adjust based on plan logic if needed
              hasAutoShutdownFeature: foundUser.allowWaterLeakConfigFeatures, // Assuming this is a direct mapping
              canAccessAiTroubleshooter: foundUser.subscription === 'Premium' || foundUser.subscription === 'Enterprise', // Example logic
            },
            firstName: foundUser.firstName,
            lastName: foundUser.lastName,
            companyName: foundUser.companyName,
            whatsappNumber: foundUser.whatsappNumber,
          });
          toast({ title: "Login Successful", description: "Welcome back!" });
          router.push('/');
        } else {
          toast({ title: "Login Failed", description: "Account status unknown or inactive.", variant: "destructive" });
          setIsLoading(false);
        }
      } catch (error) {
        console.error("User login error:", error);
        toast({ title: "Login Failed", description: "An unexpected error occurred.", variant: "destructive" });
        setIsLoading(false);
      }
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Login to IoT Guardian</CardTitle>
        <CardDesc>Enter your credentials to access your dashboard or admin panel.</CardDesc>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username / Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com or admin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adminToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Token (Optional)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter if logging in as admin" {...field} />
                  </FormControl>
                  <FormMessage />
                  <FormDescription>Only required if username is 'admin'.</FormDescription>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 text-sm">
         <Link href="#" className="text-primary hover:underline">
            Forgot password?
          </Link>
        <p className="text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-primary hover:underline">
            Register here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
