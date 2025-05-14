
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { AppNotification } from '@/context/user-context';
import { Send } from 'lucide-react';

const LOCAL_STORAGE_KEY_NOTIFICATIONS = 'iot-guardian-userNotifications';

const formSchema = z.object({
  message: z.string().min(10, { message: "Notification message must be at least 10 characters." }).max(500, { message: "Notification message must not exceed 500 characters." }),
  // target: z.enum(["all_users"]).default("all_users"), // For future extension to target specific users
});

export default function AdminSendNotificationsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      // target: "all_users",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const existingNotificationsString = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFICATIONS);
      let existingNotifications: AppNotification[] = [];
      if (existingNotificationsString) {
        try {
          existingNotifications = (JSON.parse(existingNotificationsString) as AppNotification[]).map(n => ({...n, timestamp: new Date(n.timestamp)}));
        } catch (e) {
          console.error("Failed to parse existing notifications from localStorage", e);
        }
      }
      
      const newNotification: AppNotification = {
        id: `admin_notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        message: values.message,
        type: 'admin',
        read: false,
        timestamp: new Date(),
        target: 'all_users', // Hardcoded for now
      };

      const updatedNotifications = [newNotification, ...existingNotifications].slice(0, 50); // Keep max 50 notifications

      localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updatedNotifications));

      toast({
        title: "Notification Sent",
        description: "The notification has been broadcast to all users.",
      });
      form.reset();
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: "Failed to send notification. Please check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Send Notifications"
        description="Broadcast messages to all users. They will appear in their notification panel."
      />

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Compose Notification</CardTitle>
          <CardDescription>
            Write your message below. Currently, all notifications are sent to all users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your notification message here..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This message will be visible to all users in their notification panel.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 
              Future Target Selection:
              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all_users">All Users</SelectItem>
                        // Add options for specific users or groups in future
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              /> 
              */}
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? 'Sending...' : 'Send Notification'}
                {!isLoading && <Send className="ml-2 h-4 w-4" />}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
