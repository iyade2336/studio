
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// --- Interfaces and Mocks for Local-Only Auth ---

export interface Subscription {
  planName: string;
  expiryDate: string; 
  maxDevices: number;
}

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  whatsapp_number: string;
  company_name: string;
  isLoggedIn: boolean;
  subscription: Subscription;
  status: 'active' | 'pending'; // Added status for admin approval
}

// In-memory user store for local development
const mockUserDatabase: Map<string, User> = new Map();

// Initialize with a pending user for demonstration
mockUserDatabase.set('user@example.com', {
    id: 'user-1',
    first_name: 'Pending',
    last_name: 'User',
    email: 'user@example.com',
    whatsapp_number: '+1234567890',
    company_name: 'Example Corp',
    isLoggedIn: false,
    status: 'pending',
    subscription: { planName: 'None', expiryDate: new Date().toISOString(), maxDevices: 0 },
});
mockUserDatabase.set('active@example.com', {
    id: 'user-2',
    first_name: 'Active',
    last_name: 'User',
    email: 'active@example.com',
    whatsapp_number: '+1987654321',
    company_name: 'Active Inc.',
    isLoggedIn: false,
    status: 'active',
    subscription: { planName: 'Premium', expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), maxDevices: 3 },
});


export const PLAN_DETAILS: Record<string, Partial<Subscription>> = {
  "None": { maxDevices: 0 },
  "Basic": { maxDevices: 1 },
  "Premium": { maxDevices: 3 },
  "Enterprise": { maxDevices: 10 }, 
};

// --- Notifications remain the same ---
export interface AppNotification {
  id: string; message: string; read: boolean; timestamp: Date; type: 'user' | 'admin' | 'system' | 'warning' | 'error';
}

const LOCAL_STORAGE_KEY_NOTIFICATIONS = 'iot-guardian-userNotifications';


// --- Context Definition ---
interface UserContextType {
  currentUser: User | null;
  isLoading: boolean;
  notifications: AppNotification[];
  unreadNotificationCount: number;
  loginUser: (email: string) => boolean; // Returns success status
  logoutUser: () => void;
  registerUser: (userData: Omit<User, 'id' | 'isLoggedIn' | 'status' | 'subscription'>) => boolean;
  getAllUsers: () => User[];
  approveUser: (email: string) => void;
  updateUserSubscription: (email: string, planName: string) => void;
  addNotification: (message: string, type: AppNotification['type']) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  getSubscriptionDaysRemaining: () => string;
  isUserApproved: (email: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// --- Provider Component ---
export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  // Load notifications from local storage on mount
  useEffect(() => {
    const storedNotifications = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFICATIONS);
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications).map((n: AppNotification) => ({...n, timestamp: new Date(n.timestamp)})));
      } catch (e) { console.error("Failed to parse notifications from localStorage", e); }
    }
  }, []);

  // Save notifications to local storage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  const loginUser = useCallback((email: string): boolean => {
    const user = mockUserDatabase.get(email);
    if (user) {
      if (user.status !== 'active') {
        toast({ title: "Account Pending", description: "Your account is awaiting admin approval.", variant: "destructive" });
        return false;
      }
      setCurrentUser({ ...user, isLoggedIn: true });
      return true;
    }
    return false;
  }, [toast]);

  const logoutUser = useCallback(() => {
    setCurrentUser(null);
    router.push('/auth/login');
  }, [router]);

  const registerUser = useCallback((userData: Omit<User, 'id' | 'isLoggedIn' | 'status' | 'subscription'>): boolean => {
    if (mockUserDatabase.has(userData.email)) {
      return false; // User already exists
    }
    const newUser: User = {
      ...userData,
      id: `user-${mockUserDatabase.size + 1}`,
      isLoggedIn: false,
      status: 'pending',
      subscription: { planName: 'None', expiryDate: new Date().toISOString(), maxDevices: 0 },
    };
    mockUserDatabase.set(newUser.email, newUser);
    return true;
  }, []);

  const getAllUsers = useCallback(() => {
    return Array.from(mockUserDatabase.values());
  }, []);

  const approveUser = useCallback((email: string) => {
    const user = mockUserDatabase.get(email);
    if (user) {
      user.status = 'active';
      // Give a 1-month free trial of Premium on approval
      user.subscription = {
          planName: 'Premium',
          maxDevices: PLAN_DETAILS['Premium'].maxDevices || 3,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }
      mockUserDatabase.set(email, user);
    }
  }, []);
  
  const updateUserSubscription = useCallback((email: string, planName: string) => {
      const user = mockUserDatabase.get(email);
      const plan = PLAN_DETAILS[planName];
      if (user && plan) {
          user.subscription = {
              planName,
              maxDevices: plan.maxDevices ?? 0,
              expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          };
          mockUserDatabase.set(email, user);
          // If updating the current user, refresh their state
          if(currentUser?.email === email) {
            setCurrentUser(prev => prev ? {...prev, subscription: user.subscription} : null);
          }
      }
  }, [currentUser]);

  const isUserApproved = useCallback((email: string): boolean => {
    const user = mockUserDatabase.get(email);
    return user?.status === 'active';
  }, []);
  
  // --- Notification handlers (no changes needed) ---
  const addNotification = useCallback((message: string, type: AppNotification['type']) => {
    const newNotification: AppNotification = { id: `notif_${Date.now()}`, message, type, read: false, timestamp: new Date() };
    setNotifications(prev => [newNotification, ...prev].slice(0, 20)); 
    toast({ title: `Notification: ${type}`, description: message, variant: type === 'error' ? 'destructive' : 'default' });
  }, [toast]);

  const markNotificationAsRead = useCallback((id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)), []);
  const markAllNotificationsAsRead = useCallback(() => setNotifications(prev => prev.map(n => ({ ...n, read: true }))), []);
  const clearNotifications = useCallback(() => setNotifications([]), []);
  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const getSubscriptionDaysRemaining = useCallback(() => {
    if (!currentUser?.isLoggedIn) return "N/A";
    const diff = new Date(currentUser.subscription.expiryDate).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `${days} day(s) remaining`;
  }, [currentUser]);


  return (
    <UserContext.Provider value={{
        currentUser, isLoading, notifications, unreadNotificationCount,
        loginUser, logoutUser, registerUser, getAllUsers, approveUser, updateUserSubscription,
        addNotification, markNotificationAsRead, markAllNotificationsAsRead, clearNotifications,
        getSubscriptionDaysRemaining, isUserApproved
      }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
