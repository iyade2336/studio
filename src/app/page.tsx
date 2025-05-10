
"use client"; // Add this to make it a Client Component

import { RealtimeDataGrid } from "@/components/dashboard/realtime-data-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, Info, Wrench, CreditCard, MonitorSmartphone } from "lucide-react"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/user-context"; // Import useUser hook

export default function DashboardPage() {
  const { currentUser } = useUser(); // Get currentUser from context

  const userName = currentUser?.isLoggedIn ? currentUser.name : "Guest";
  const subscriptionPlan = currentUser?.isLoggedIn ? currentUser.subscription.planName : "No Plan";
  const alertsCount = currentUser?.isLoggedIn ? (currentUser as any).alerts || 0 : 0; // Assuming alerts might be on currentUser

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title={`Welcome, ${userName}!`}
        description={currentUser?.isLoggedIn ? `You are currently on the ${subscriptionPlan}.` : "Please log in or register to manage your devices."}
      />

      {currentUser?.isLoggedIn && alertsCount > 0 && (
        <Card className="bg-yellow-50 border-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-600">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3" />
              <CardTitle className="text-yellow-700 dark:text-yellow-300">
                {alertsCount} Active Alert{alertsCount > 1 ? 's' : ''}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-600 dark:text-yellow-400">
              Some of your devices require attention. Please check their status below.
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm" asChild>
                {/* TODO: Create an /alerts page or link to relevant section */}
                <Link href="/#alerts-section"> 
                  <span className="flex items-center">View Alerts</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Real-time Sensor Data</CardTitle>
        </CardHeader>
        <CardContent>
          <RealtimeDataGrid />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="mr-2 h-5 w-5 text-accent" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/troubleshoot">
                <span className="flex items-center w-full">
                  <MonitorSmartphone className="mr-2 h-4 w-4" />
                  AI Troubleshooter
                </span>
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/issues">
                 <span className="flex items-center w-full">
                   <Wrench className="mr-2 h-4 w-4" />
                   View Common Issues
                 </span>
              </Link>
            </Button>
             <Button variant="secondary" className="w-full justify-start" asChild>
              <Link href="/subscriptions">
                 <span className="flex items-center w-full">
                   <CreditCard className="mr-2 h-4 w-4" />
                   Manage Subscription
                 </span>
              </Link>
            </Button>
          </CardContent>
        </Card>
         <Card className="bg-primary/10 border-primary/30 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              Need help?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground mb-4">
              If you're experiencing issues or have questions, our AI assistant can help, or you can browse common solutions.
            </p>
            <Button className="w-full" asChild>
              <Link href="/troubleshoot">
                 <span className="flex items-center justify-center w-full">
                    Ask AI Assistant
                 </span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
