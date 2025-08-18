
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
import { Card, CardContent, CardDescription as CardDesc, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useUser } from "@/context/user-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from '@/context/admin-auth-context';
import { supabase } from "@/lib/supabase";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useUser();
  const adminAuth = useAdminAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [resetEmail, setResetEmail] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({ title: "Email required", description: "Please enter your email address to reset the password.", variant: "destructive"});
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      toast({ title: "Password Reset Email Sent", description: "Please check your inbox to reset your password."});
    } catch (error: any) {
       console.error("Password reset error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
    });

    if (signInError) {
        let errorMessage = "Invalid email or password. Please check your credentials and try again.";
        if (signInError.message.includes("Email not confirmed")) {
            errorMessage = "Please confirm your email address before logging in."
        }
        toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
        setIsLoading(false);
        return;
    }

    if (signInData.user) {
        // After successful auth, get user data from 'users' table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', signInData.user.id)
            .single();
        
        if (userError || !userData) {
            await supabase.auth.signOut();
            toast({ title: "Login Failed", description: "Could not find user data. Please contact support.", variant: "destructive" });
            setIsLoading(false);
            return;
        }

        // Check user role
        if (userData.role === 'admin') {
            adminAuth.loginAsAdmin();
            toast({ title: "Admin Login Successful", description: "Redirecting to admin dashboard..." });
            router.push('/admin');
        } else if (userData.role === 'user') {
            loginUser(userData);
            toast({ title: "Login Successful", description: "Welcome back!" });
            router.push('/dashboard');
        } else {
            await supabase.auth.signOut();
            toast({ title: "Login Failed", description: "Your account role is not recognized.", variant: "destructive" });
            setIsLoading(false);
        }
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Login to IoT Guardian</CardTitle>
        <CardDesc>Enter your credentials to access your dashboard.</CardDesc>
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
                    <Input placeholder="user@example.com" {...field} />
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
      <CardFooter className="flex flex-col gap-4 text-sm">
         <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto">Forgot password?</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Reset your password</AlertDialogTitle>
                <AlertDialogDescription>
                    Enter your email address below and we will send you a link to reset your password.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <Input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                />
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handlePasswordReset} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : "Send Reset Link"}
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

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
