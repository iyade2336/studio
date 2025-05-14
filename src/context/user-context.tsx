
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Subscription {
  planName: string;
  expiryDate: string; // ISO string "YYYY-MM-DDTHH:mm:ss.sssZ"
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
  expiryDate?: string; // Added to ensure it's passed correctly during login
}

export interface AppNotification {
  id: string;
  message: string;
  read: boolean;
  timestamp: Date;
  type: 'user' | 'admin' | 'arduino' | 'system';
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock initial user data - will be overridden by login or localStorage
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
  }
}

const LOCAL_STORAGE_KEY_CURRENT_USER = 'iot-guardian-currentUser';
const LOCAL_STORAGE_KEY_NOTIFICATIONS = 'iot-guardian-userNotifications';


export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USER_LOGGED_OUT);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY_CURRENT_USER);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        if (parsedUser.isLoggedIn) {
           setCurrentUser(parsedUser);
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
    const userToSave: User = {
      ...userData,
      isLoggedIn: true,
      name: `${userData.firstName} ${userData.lastName}`,
      subscription: { // Ensure subscription object is correctly formed
        planName: userData.subscription?.planName || "None",
        expiryDate: userData.subscription?.expiryDate || new Date(0).toISOString(),
      }
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
  }, []);

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
    if (!currentUser || !currentUser.isLoggedIn || currentUser.subscription.planName === "None") {
      return "N/A";
    }
    if (!currentUser.subscription.expiryDate) {
        return "No expiry date set.";
    }

    const expiry = new Date(currentUser.subscription.expiryDate);
    const now = new Date();

    if (expiry < now) {
      // If plan is not "None" but expired, it's expired.
      if(currentUser.subscription.planName !== "None") {
        return "Expired";
      }
      return "N/A"; // Should not happen if plan is "None"
    }

    const diffTime = expiry.getTime() - now.getTime();
    
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    let remainingString = "";
    if (days > 0) remainingString += `${days}d `;
    if (days > 0 || hours > 0 ) remainingString += `${hours}h `;
    remainingString += `${minutes}m remaining`;
    
    return remainingString.trim();
  }, [currentUser]);

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
