
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface Subscription {
  planName: string;
  expiryDate: string; // ISO string "YYYY-MM-DDTHH:mm:ss.sssZ"
  // Derived or set by admin/login logic
  maxDevices: number;
  canControlDevice: boolean; // For on/off commands
  canExportCsv: boolean;
  hasAutoShutdownFeature: boolean; // For leak/temp auto-shutdown alerts
  canAccessAiTroubleshooter: boolean;
}

// Updated User interface
export interface User {
  id: string;
  name: string; // Combined Full Name (firstName + lastName)
  firstName: string;
  lastName: string;
  email: string;
  whatsappNumber: string;
  companyName: string;
  isLoggedIn: boolean;
  subscription: Subscription;
  // Admin-configurable features, overriding plan defaults if necessary
  allowBluetoothControlFeatures?: boolean; 
  allowWaterLeakConfigFeatures?: boolean; 
  // Actual connected devices (future enhancement, for now matches maxDevices or is illustrative)
  currentDeviceCount?: number; 
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
  notifications: AppNotification[];
  unreadNotificationCount: number;
  loginUser: (userData: User) => void;
  logoutUser: () => void;
  addNotification: (message: string, type: AppNotification['type']) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotifications: () => void;
  getSubscriptionDaysRemaining: () => string;
  checkDeviceLimit: (currentDeviceCount: number) => boolean; // True if within limit
  refreshCurrentUser: (updatedUserData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const PLAN_DETAILS: Record<string, Partial<Subscription>> = {
  "None": { maxDevices: 0, canControlDevice: false, canExportCsv: false, hasAutoShutdownFeature: false, canAccessAiTroubleshooter: false },
  "Free Trial": { maxDevices: 1, canControlDevice: false, canExportCsv: true, hasAutoShutdownFeature: false, canAccessAiTroubleshooter: true },
  "Basic": { maxDevices: 1, canControlDevice: false, canExportCsv: true, hasAutoShutdownFeature: false, canAccessAiTroubleshooter: false },
  "Premium": { maxDevices: 3, canControlDevice: true, canExportCsv: true, hasAutoShutdownFeature: true, canAccessAiTroubleshooter: true },
  "Enterprise": { maxDevices: 10, canControlDevice: true, canExportCsv: true, hasAutoShutdownFeature: true, canAccessAiTroubleshooter: true }, // Default for Enterprise, admin can override
};


const MOCK_USER_LOGGED_OUT: User = {
  id: '',
  name: 'Guest',
  firstName: '',
  lastName: '',
  email: '',
  whatsappNumber: '',
  companyName: '',
  isLoggedIn: false,
  subscription: {
    planName: 'None',
    expiryDate: new Date(0).toISOString(),
    maxDevices: PLAN_DETAILS["None"].maxDevices!,
    canControlDevice: PLAN_DETAILS["None"].canControlDevice!,
    canExportCsv: PLAN_DETAILS["None"].canExportCsv!,
    hasAutoShutdownFeature: PLAN_DETAILS["None"].hasAutoShutdownFeature!,
    canAccessAiTroubleshooter: PLAN_DETAILS["None"].canAccessAiTroubleshooter!,
  }
}

const LOCAL_STORAGE_KEY_CURRENT_USER = 'iot-guardian-currentUser';
const LOCAL_STORAGE_KEY_NOTIFICATIONS = 'iot-guardian-userNotifications';


export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USER_LOGGED_OUT);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const router = useRouter();
  const { toast } = useToast(); // Initialize toast

  useEffect(() => {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_USER);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        if (parsedUser.isLoggedIn) {
           // Ensure subscription details are fully populated based on planName
           const planDetails = PLAN_DETAILS[parsedUser.subscription.planName] || PLAN_DETAILS["None"];
           setCurrentUser({
             ...parsedUser,
             subscription: {
               ...parsedUser.subscription,
               maxDevices: parsedUser.subscription.maxDevices ?? planDetails.maxDevices!,
               canControlDevice: parsedUser.subscription.canControlDevice ?? planDetails.canControlDevice!,
               canExportCsv: parsedUser.subscription.canExportCsv ?? planDetails.canExportCsv!,
               hasAutoShutdownFeature: parsedUser.subscription.hasAutoShutdownFeature ?? planDetails.hasAutoShutdownFeature!,
               canAccessAiTroubleshooter: parsedUser.subscription.canAccessAiTroubleshooter ?? planDetails.canAccessAiTroubleshooter!,
             }
           });
        } else {
          setCurrentUser(MOCK_USER_LOGGED_OUT);
        }
      } catch (e) {
        setCurrentUser(MOCK_USER_LOGGED_OUT); 
      }
    } else {
       setCurrentUser(MOCK_USER_LOGGED_OUT);
    }

    const storedNotifications = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFICATIONS);
    if (storedNotifications) {
      try {
        const parsedNotifications = (JSON.parse(storedNotifications) as AppNotification[]).map(n => ({...n, timestamp: new Date(n.timestamp)}));
        setNotifications(parsedNotifications);
      } catch(e) {
        // ignore
      }
    } else {
        setNotifications([
            { id: '1', message: 'Welcome to IoT Guardian!', type: 'system', read: false, timestamp: new Date(Date.now() - 1000 * 60 * 5) },
            { id: '2', message: 'Device "Living Room Sensor" reported high temperature.', type: 'arduino', read: true, timestamp: new Date(Date.now() - 1000 * 60 * 60) },
        ]);
    }
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.isLoggedIn) {
      localStorage.setItem(LOCAL_STORAGE_KEY_CURRENT_USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY_CURRENT_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);


  const loginUser = useCallback((userData: User) => {
    const planName = userData.subscription?.planName || "None";
    const planDetails = PLAN_DETAILS[planName] || PLAN_DETAILS["None"];

    const userToSave: User = {
      ...userData,
      isLoggedIn: true,
      name: `${userData.firstName} ${userData.lastName}`,
      subscription: {
        planName: planName,
        expiryDate: userData.subscription?.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default expiry
        maxDevices: userData.subscription?.maxDevices ?? planDetails.maxDevices!,
        canControlDevice: userData.subscription?.canControlDevice ?? planDetails.canControlDevice!,
        canExportCsv: userData.subscription?.canExportCsv ?? planDetails.canExportCsv!,
        hasAutoShutdownFeature: userData.subscription?.hasAutoShutdownFeature ?? planDetails.hasAutoShutdownFeature!,
        canAccessAiTroubleshooter: userData.subscription?.canAccessAiTroubleshooter ?? planDetails.canAccessAiTroubleshooter!,
      },
    };
    setCurrentUser(userToSave);
  }, []);

  const logoutUser = useCallback(() => {
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
    
    if (diffDays === 0) { // If it expires today
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
