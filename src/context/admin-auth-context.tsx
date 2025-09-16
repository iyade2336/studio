
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  loginAsAdmin: (callback?: () => void) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// A simple in-memory flag for admin state.
// In a real app, this would be a secure session.
let adminLoggedIn = false;

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(adminLoggedIn);
  const [isLoading, setIsLoading] = useState(false); // No async check needed now
  const router = useRouter();

  const loginAsAdmin = useCallback((callback?: () => void) => {
    adminLoggedIn = true;
    setIsAdmin(true);
    if (callback) {
        callback();
    } else {
        router.push('/admin');
    }
  }, [router]);

  const logout = useCallback(() => {
    adminLoggedIn = false;
    setIsAdmin(false);
    router.push('/auth/login');
  }, [router]);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, loginAsAdmin, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
