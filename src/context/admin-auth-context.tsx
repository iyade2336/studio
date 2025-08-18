
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  loginAsAdmin: () => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAdminStatus = useCallback(async (user: User | null) => {
    if (user) {
      const { data: userData, error } = await supabase
        .from('users')
        .select('role, status')
        .eq('id', user.id)
        .single();

      if (userData && userData.role === 'admin' && userData.status === 'active') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      checkAdminStatus(session?.user ?? null);
    });

    // Initial check
    const checkInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        await checkAdminStatus(session?.user ?? null);
    };
    checkInitialSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const loginAsAdmin = useCallback(() => {
    setIsAdmin(true);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
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
