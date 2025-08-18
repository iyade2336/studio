
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AdminAuthContextType {
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => boolean; // Pass is now a placeholder
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // This effect will check auth state from Firebase on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is logged in, check if they are an admin from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().role === 'admin' && docSnap.data().status === 'active') {
          setIsAdmin(true);
           try {
            localStorage.setItem('isAdminAuthenticated', 'true');
          } catch (error) {
            console.error("Could not access localStorage:", error);
          }
        } else {
          // User is not an admin, ensure they are logged out from admin context
          setIsAdmin(false);
           try {
            localStorage.removeItem('isAdminAuthenticated');
          } catch (error) {
            console.error("Could not access localStorage:", error);
          }
        }
      } else {
        // No user logged in
        setIsAdmin(false);
         try {
          localStorage.removeItem('isAdminAuthenticated');
        } catch (error) {
          console.error("Could not access localStorage:", error);
        }
      }
      setIsLoading(false);
    });

    // Also check localStorage for quick initial state, but Firebase is source of truth
    try {
        const storedIsAdmin = localStorage.getItem('isAdminAuthenticated');
        if (storedIsAdmin === 'true' && !auth.currentUser) {
            // This state is invalid if there's no firebase user, clear it.
            localStorage.removeItem('isAdminAuthenticated');
        }
    } catch (error) {
        console.error("Could not access localStorage:", error);
    }


    return () => unsubscribe();
  }, []);

  const login = useCallback((email: string, pass: string): boolean => {
    // This login is now just for setting the in-app state after Firebase confirms admin role
    // The actual authentication is handled by the login form.
    setIsAdmin(true);
    try {
      localStorage.setItem('isAdminAuthenticated', 'true');
    } catch (error) {
      console.error("Could not access localStorage:", error);
    }
    return true;
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
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
