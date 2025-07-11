
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from '@/components/layout/main-layout';
import { AdminAuthProvider } from '@/context/admin-auth-context';
import { UserProvider } from '@/context/user-context';
import { QueryProvider } from '@/components/providers/query-provider'; // Added import

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'IoT Guardian',
  description: 'Monitor and manage your IoT devices with AI-powered insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <QueryProvider>
          <AdminAuthProvider>
            <UserProvider>
              <MainLayout>
                {children}
              </MainLayout>
            </UserProvider>
          </AdminAuthProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
