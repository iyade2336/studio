
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
import { useToast } from "@/hooks/use-toast";
import type { AdminUser } from "@/app/admin/users/page"; // Assuming AdminUser type is exported or moved to a shared types file

const formSchema = z.object({
  firstName: z.string().min(2, {message: "First name must be at least 2 characters."}),
  lastName: z.string().min(2, {message: "Last name must be at least 2 characters."}),
  email: z.string().email({ message: "Invalid email address." }),
  whatsappNumber: z.string().min(10, { message: "WhatsApp number must be at least 10 digits." }).regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid WhatsApp number format."}),
  companyName: z.string().min(2, {message: "Company name must be at least 2 characters."}),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, {message: "Password must be at least 6 characters."})
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      whatsappNumber: "",
      companyName: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // Simulate API call / saving to local storage
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const existingUsersString = localStorage.getItem("iot-guardian-users");
      const existingUsers: AdminUser[] = existingUsersString ? JSON.parse(existingUsersString) : [];

      const emailExists = existingUsers.some(user => user.email === values.email);
      if (emailExists) {
        toast({
          title: "Registration Failed",
          description: "An account with this email already exists.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const newUser: AdminUser = {
        id: `usr_${Date.now()}`,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        whatsappNumber: values.whatsappNumber,
        companyName: values.companyName,
        // Password should be hashed in a real app; storing it here directly for demo purposes only.
        // In a real scenario, the backend would handle password hashing and storage.
        // For this local simulation, we might not even store the password or store a mock hash.
        // Let's assume password isn't stored directly in the AdminUser object visible to admin.
        subscription: "None",
        devices: 0,
        joinedDate: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format
        avatarUrl: `https://picsum.photos/seed/${Date.now()}/40/40`, // Placeholder avatar
        status: 'pending',
        // Add a field for the password (or a mock hash) if login form needs to check it from localStorage
        // This is insecure for real apps.
        passwordHash: values.password, // SUPER INSECURE - FOR DEMO ONLY
      };

      existingUsers.push(newUser);
      localStorage.setItem("iot-guardian-users", JSON.stringify(existingUsers));

      toast({
        title: "Registration Successful",
        description: "Your account has been created and is awaiting admin approval.",
      });
      form.reset();

    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>Join IoT Guardian to monitor your devices. Your account will require admin approval.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp" {...field} />
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-sm">
        <p className="text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Login here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
