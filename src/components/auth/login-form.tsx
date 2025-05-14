
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/context/user-context"; 
import { useRouter } from "next/navigation"; 
import { useToast } from "@/hooks/use-toast"; 
import type { AdminUser } from "@/app/admin/users/page"; 

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const LOCAL_STORAGE_KEY_USERS = "iot-guardian-users";

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

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
            expiryDate: foundUser.expiryDate || new Date(0).toISOString(), 
          },
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          companyName: foundUser.companyName,
          whatsappNumber: foundUser.whatsappNumber,
          // Pass expiryDate explicitly if User interface expects it at top level too
          // expiryDate: foundUser.expiryDate, 
        });
        toast({ title: "Login Successful", description: "Welcome back!" });
        router.push('/'); 
      } else {
        toast({ title: "Login Failed", description: "Account status unknown.", variant: "destructive" });
        setIsLoading(false);
      }

    } catch (error) {
      console.error("Login error:", error);
      toast({ title: "Login Failed", description: "An unexpected error occurred.", variant: "destructive" });
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Login to IoT Guardian</CardTitle>
        <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
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
