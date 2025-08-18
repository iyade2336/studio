
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';


export interface Subscription {
  planName: string;
  expiryDate: string; 
  maxDevices: number;
  canControlDevice: boolean;
  canExportCsv: boolean;
  hasAutoShutdownFeature: boolean; 
  canAccessAiTroubleshooter: boolean;
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
  role: 'user' | 'admin';
  allow_bluetooth_control: boolean;
  allow_water_leak_config: boolean;
}


export interface AppNotification {
  id: string;
  message: string;
  read: boolean;
  timestamp: Date;
  type: 'user' | 'admin' | 'arduino' | 'system' | 'warning' | 'error';
}

interface UserContextType {
  currentUser: User | null;
  isLoading: boolean;
  notifications: AppNotification[];
  unreadNotificationCount: number;
  loginUser: (userData: User) => void;
  logoutUser: () => void;
  addNotification: (message: string, type: AppNotification['type']) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  getSubscriptionDaysRemaining: () => string;
  checkDeviceLimit: (currentDeviceCount: number) => boolean;
  refreshCurrentUser: (updatedUserData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const PLAN_DETAILS: Record<string, Partial<Subscription>> = {
  "None": { maxDevices: 0, canControlDevice: false, canExportCsv: false, hasAutoShutdownFeature: false, canAccessAiTroubleshooter: false },
  "Free Trial": { maxDevices: 1, canControlDevice: false, canExportCsv: true, hasAutoShutdownFeature: false, canAccessAiTroubleshooter: true },
  "Basic": { maxDevices: 1, canControlDevice: false, canExportCsv: true, hasAutoShutdownFeature: false, canAccessAiTroubleshooter: false },
  "Premium": { maxDevices: 3, canControlDevice: true, canExportCsv: true, hasAutoShutdownFeature: true, canAccessAiTroubleshooter: true },
  "Enterprise": { maxDevices: 10, canControlDevice: true, canExportCsv: true, hasAutoShutdownFeature: true, canAccessAiTroubleshooter: true }, 
};

const MOCK_USER_LOGGED_OUT: User = {
  id: '',
  first_name: 'Guest',
  last_name: '',
  email: '',
  whatsapp_number: '',
  company_name: '',
  isLoggedIn: false,
  role: 'user',
  allow_bluetooth_control: false,
  allow_water_leak_config: false,
  subscription: {
    planName: 'None',
    expiryDate: new Date(0).toISOString(),
    ...PLAN_DETAILS["None"],
  } as Subscription,
};

const LOCAL_STORAGE_KEY_NOTIFICATIONS = 'iot-guardian-userNotifications';

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  const fetchAndSetUser = useCallback(async (session: Session | null) => {
    if (session?.user) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (data && !error) {
        if (data.role !== 'user') {
          setCurrentUser(MOCK_USER_LOGGED_OUT);
          setIsLoading(false);
          return;
        }

        const planName = data.subscription;
        const planDetails = PLAN_DETAILS[planName] || PLAN_DETAILS["None"];

        setCurrentUser({
          ...data,
          isLoggedIn: true,
          subscription: {
            planName: planName,
            expiryDate: data.subscription_expiry_date || new Date().toISOString(),
            maxDevices: data.allowed_devices ?? planDetails.maxDevices ?? 0,
            canControlDevice: planDetails.canControlDevice ?? false,
            canExportCsv: planDetails.canExportCsv ?? false,
            hasAutoShutdownFeature: planDetails.hasAutoShutdownFeature ?? false,
            canAccessAiTroubleshooter: planDetails.canAccessAiTroubleshooter ?? false,
          },
        });
      } else {
        await supabase.auth.signOut();
        setCurrentUser(MOCK_USER_LOGGED_OUT);
      }
    } else {
      setCurrentUser(MOCK_USER_LOGGED_OUT);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        fetchAndSetUser(session);
      }
    );
    
    // Initial check
    const checkInitialSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        fetchAndSetUser(session);
    };
    checkInitialSession();

    const storedNotifications = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFICATIONS);
    if (storedNotifications) {
      try {
        const parsedNotifications = (JSON.parse(storedNotifications) as AppNotification[]).map(n => ({...n, timestamp: new Date(n.timestamp)}));
        setNotifications(parsedNotifications);
      } catch(e) { /* ignore */ }
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchAndSetUser]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  const loginUser = useCallback((userData: any) => {
    const planName = userData.subscription;
    const planDetails = PLAN_DETAILS[planName] || PLAN_DETAILS["None"];
     setCurrentUser({
          ...userData,
          isLoggedIn: true,
          subscription: {
            planName: planName,
            expiryDate: userData.subscription_expiry_date || new Date().toISOString(),
            maxDevices: userData.allowed_devices ?? planDetails.maxDevices ?? 0,
            canControlDevice: planDetails.canControlDevice ?? false,
            canExportCsv: planDetails.canExportCsv ?? false,
            hasAutoShutdownFeature: planDetails.hasAutoShutdownFeature ?? false,
            canAccessAiTroubleshooter: planDetails.canAccessAiTroubleshooter ?? false,
          },
        });
  }, []);

  const logoutUser = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(MOCK_USER_LOGGED_OUT);
    router.push('/auth/login');
  }, [router]);

  const addNotification = useCallback((message: string, type: AppNotification['type']) => {
    const newNotification: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      message,
      type,
      read: false,
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 20)); 
    if (type === 'warning' || type === 'error' || type === 'arduino') {
      toast({
        title: type.charAt(0).toUpperCase() + type.slice(1) + " Notification",
        description: message,
        variant: type === 'error' || type === 'warning' ? 'destructive' : 'default',
      });
    }
  }, [toast]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  const getSubscriptionDaysRemaining = useCallback((): string => {
    if (!currentUser || !currentUser.isLoggedIn || !currentUser.subscription.expiryDate) {
      return "N/A";
    }
    const expiry = new Date(currentUser.subscription.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiry < today) {
      return "Expired";
    }

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        const diffMs = new Date(currentUser.subscription.expiryDate).getTime() - new Date().getTime();
        if (diffMs <= 0) return "Expired";
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        if (diffHours > 0) return `Expires in ${diffHours}h ${diffMinutes}m`;
        if (diffMinutes > 0) return `Expires in ${diffMinutes}m`;
        return "Expires very soon";
    }
    return `${diffDays} day(s) remaining`;
  }, [currentUser]);

  const checkDeviceLimit = useCallback((currentDeviceCount: number): boolean => {
    if (!currentUser || !currentUser.isLoggedIn) return false;
    return currentDeviceCount < currentUser.subscription.maxDevices;
  }, [currentUser]);

  const refreshCurrentUser = useCallback((updatedUserData: Partial<User>) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedUserData };
      if(updatedUserData.subscription) {
        newUser.subscription = {...prevUser.subscription, ...updatedUserData.subscription};
      }
      return newUser;
    });
  }, []);


  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoading,
        notifications,
        unreadNotificationCount,
        loginUser,
        logoutUser,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        getSubscriptionDaysRemaining,
        checkDeviceLimit,
        refreshCurrentUser,
      }}
    >
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
