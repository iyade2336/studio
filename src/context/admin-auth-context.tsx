
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  login: (usernameInput: string, passwordInput: string) => boolean;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_PASSWORD = "123456789";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedIsAdmin = localStorage.getItem('isAdminAuthenticated');
      if (storedIsAdmin === 'true') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((emailInput: string, passwordInput: string): boolean => {
    if (emailInput === ADMIN_EMAIL && passwordInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      try {
        localStorage.setItem('isAdminAuthenticated', 'true');
      } catch (error)
      {
        console.error("Could not access localStorage:", error);
      }
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    try {
      localStorage.removeItem('isAdminAuthenticated');
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
    router.push('/auth/login');
  }, [router]);

  return (
    <AdminAuthContext.Provider value={{ isAdmin, isLoading, login, logout }}>
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
