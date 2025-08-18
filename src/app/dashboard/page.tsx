
"use client"; 

import { RealtimeDataGrid } from "@/components/dashboard/realtime-data-grid";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, Info, Wrench, CreditCard, MonitorSmartphone } from "lucide-react"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/context/user-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { translations } from "@/lib/translations";

export default function DashboardPage() {
  const { currentUser, isLoading: isUserLoading } = useUser(); 
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  useEffect(() => {
    if (!isUserLoading && !currentUser?.isLoggedIn) {
      router.push('/auth/login');
    }
  }, [currentUser, isUserLoading, router]);

  if (isUserLoading || !currentUser?.isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-lg">{t.dashboard.loading}</p>
      </div>
    );
  }

  const userName = currentUser?.first_name || t.dashboard.guest;
  const subscriptionPlan = currentUser?.subscription.planName || t.dashboard.noPlan;
  
  const alertsCount = 0; // Placeholder for future alert system integration

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title={`${t.dashboard.welcome}, ${userName}!`}
        description={currentUser?.isLoggedIn ? `${t.dashboard.currentPlan} ${subscriptionPlan}.` : t.dashboard.loginPrompt}
      />

      {alertsCount > 0 && (
        <Card className="bg-yellow-50 border-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-600">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3" />
              <CardTitle className="text-yellow-700 dark:text-yellow-300">
                {alertsCount} {t.dashboard.activeAlerts(alertsCount)}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-600 dark:text-yellow-400">
              {t.dashboard.attentionNeeded}
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard#alerts-section"> 
                  <span className="flex items-center">{t.dashboard.viewAlerts}</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Device Data</CardTitle>
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
              {t.dashboard.quickActions}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/troubleshoot">
                <span className="flex items-center w-full">
                  <MonitorSmartphone className="mr-2 h-4 w-4" />
                  Troubleshooting
                </span>
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/issues">
                 <span className="flex items-center w-full">
                   <Wrench className="mr-2 h-4 w-4" />
                   {t.dashboard.viewCommonIssues}
                 </span>
              </Link>
            </Button>
             <Button variant="secondary" className="w-full justify-start" asChild>
              <Link href="/subscriptions">
                 <span className="flex items-center w-full">
                   <CreditCard className="mr-2 h-4 w-4" />
                   {t.dashboard.manageSubscription}
                 </span>
              </Link>
            </Button>
          </CardContent>
        </Card>
         <Card className="bg-primary/10 border-primary/30 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              {t.dashboard.needHelp}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground mb-4">
              {t.dashboard.needHelpDescription}
            </p>
            <Button className="w-full" asChild>
              <Link href="/contact">
                 <span className="flex items-center justify-center w-full">
                    Contact Support
                 </span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
