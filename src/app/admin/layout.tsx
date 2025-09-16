
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useAdminAuth } from '@/context/admin-auth-context';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isAdmin, isLoading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace('/auth/login');
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-foreground admin-dashboard">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading Admin Area...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background text-foreground admin-dashboard">
        <p className="text-lg text-destructive">Redirecting to login...</p>
      </div>
    );
  }

  // The admin-dashboard class applies the specific dark theme from globals.css
  return <div className="admin-dashboard">{children}</div>;
}
