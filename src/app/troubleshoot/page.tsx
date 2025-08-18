
"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { TroubleshootingForm } from "@/components/troubleshoot/troubleshooting-form";
import { TroubleshootingResult } from "@/components/troubleshoot/troubleshooting-result";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Lock, Wrench } from "lucide-react";
import { useUser } from "@/context/user-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TroubleshootPage() {
  const { currentUser } = useUser();

  if (!currentUser || !currentUser.isLoggedIn) {
    return (
      <div className="space-y-6 md:space-y-8">
        <PageHeader
          title="Troubleshooting"
          description="Log in to access troubleshooting guides for your sensor issues."
        />
        <Card className="shadow-md text-center">
            <CardHeader>
                <CardTitle className="flex items-center justify-center">
                    <Lock className="mr-2 h-6 w-6 text-primary" />
                    Access Restricted
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4">Please log in to use the troubleshooting feature.</p>
                <Button asChild>
                    <Link href="/auth/login">Login</Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <PageHeader
        title="Troubleshooting"
        description="Find guides and solutions for common sensor issues."
      />
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="mr-2 h-6 w-6 text-accent" />
            Common Issues
          </CardTitle>
          <CardDescription>
            Browse our guides for solutions to common problems.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">The AI troubleshooting feature has been disabled. Please refer to our common issues page for help.</p>
           <Button asChild>
              <Link href="/issues">View Common Issues</Link>
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
