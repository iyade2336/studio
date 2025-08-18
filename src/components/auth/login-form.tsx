
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
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import type { User } from "@/context/user-context";

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


const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "123456789";


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
      await sendPasswordResetEmail(auth, resetEmail);
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

    // Admin login check
    if (values.email === ADMIN_EMAIL && values.password === ADMIN_PASSWORD) {
      const adminLoginSuccess = adminAuth.login(values.email, values.password);
      if (adminLoginSuccess) {
        toast({ title: "Admin Login Successful", description: "Redirecting to admin dashboard..." });
        router.push('/admin');
      } else {
        toast({ title: "Admin Login Failed", description: "An unexpected error occurred.", variant: "destructive" });
        setIsLoading(false);
      }
      return;
    }

    // Regular user login
    try {
        const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            throw new Error("User data not found in Firestore.");
        }

        const userData = userDoc.data();

        if (userData.status === 'pending') {
          await signOut(auth);
          toast({ title: "Login Pending", description: "Your account is awaiting admin approval.", variant: "default", duration: 7000 });
          setIsLoading(false);
          return;
        }

        if (userData.status === 'rejected') {
          await signOut(auth);
          toast({ title: "Login Failed", description: "Your account registration has been rejected.", variant: "destructive", duration: 7000 });
          setIsLoading(false);
          return;
        }
        
        if (userData.status === 'active') {
             loginUser({
                id: user.uid,
                uid: user.uid,
                name: `${userData.firstName} ${userData.lastName}`,
                email: userData.email,
                isLoggedIn: true,
                ...userData
            } as User);
            toast({ title: "Login Successful", description: "Welcome back!" });
            router.push('/dashboard');
        } else {
            await signOut(auth);
            toast({ title: "Login Failed", description: "Account status unknown or inactive.", variant: "destructive" });
            setIsLoading(false);
        }

    } catch (error: any) {
        console.error("User login error:", error);
        let errorMessage = "An unexpected error occurred. Please try again.";

        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            // Check if user exists but is pending/rejected
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", values.email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0].data();
                 if (userDoc.status === 'pending') {
                    errorMessage = "Your account is awaiting admin approval. You will be notified once it's active.";
                } else if (userDoc.status === 'rejected') {
                    errorMessage = "Your account registration has been rejected by an administrator.";
                } else {
                    errorMessage = "Invalid email or password. Please check your credentials and try again.";
                }
            } else {
                 errorMessage = "Invalid email or password. Please check your credentials and try again.";
            }
        }
        toast({ title: "Login Failed", description: errorMessage, variant: "destructive", duration: 7000 });
        setIsLoading(false);
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
