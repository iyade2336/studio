
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
import { useUser } from "@/context/user-context"; // Import useUser
import { useRouter } from "next/navigation"; // Import useRouter
import { useToast } from "@/hooks/use-toast"; // Import useToast

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }), // Simplified for demo
});

// Mock user data for login simulation
const MOCK_USER_CREDENTIALS = {
  email: "demo@example.com",
  password: "password123",
  userData: {
    id: 'user-123',
    name: 'Demo User',
    email: 'demo@example.com',
    isLoggedIn: true,
    subscription: {
      planName: 'Premium Plan',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  }
};


export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { loginUser } = useUser(); // Use the loginUser function from context
  const router = useRouter(); // For redirection
  const { toast } = useToast(); // For notifications

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API call & authentication
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (values.email === MOCK_USER_CREDENTIALS.email && values.password === MOCK_USER_CREDENTIALS.password) {
      loginUser(MOCK_USER_CREDENTIALS.userData);
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push('/'); // Redirect to dashboard
    } else {
      toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
      setIsLoading(false);
    }
    // setIsLoading(false) will be handled by redirect or explicit set on error
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
                    <Input type="email" placeholder="demo@example.com" {...field} />
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
                    <Input type="password" placeholder="password123" {...field} />
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
