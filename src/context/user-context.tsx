
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Subscription {
  planName: string;
  expiryDate: string; // ISO string "YYYY-MM-DDTHH:mm:ss.sssZ"
}

interface User {
  id: string;
  name: string;
  email: string;
  isLoggedIn: boolean;
  subscription: Subscription;
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

// Mock initial user data
const MOCK_USER_LOGGED_IN: User = {
  id: 'user-123',
  name: 'Demo User',
  email: 'demo@example.com',
  isLoggedIn: true,
  subscription: {
    planName: 'Premium Plan',
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 30 days
  },
};

const MOCK_USER_LOGGED_OUT: User = {
  id: '',
  name: 'Guest',
  email: '',
  isLoggedIn: false,
  subscription: {
    planName: 'None',
    expiryDate: new Date(0).toISOString(),
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking auth status or loading from localStorage
    // For demo, we'll set the mock user as logged in initially.
    // In a real app, you'd check a token or session.
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        if (parsedUser.isLoggedIn) {
           setCurrentUser(parsedUser);
        } else {
          setCurrentUser(MOCK_USER_LOGGED_OUT);
        }
      } catch (e) {
        setCurrentUser(MOCK_USER_LOGGED_OUT); // Fallback to logged out if parsing fails
      }
    } else {
      // For demo purposes, log in the mock user by default.
      // In a real app, this would likely be null until actual login.
      loginUser(MOCK_USER_LOGGED_IN);
    }

    // Load notifications from localStorage or initialize
    const storedNotifications = localStorage.getItem('userNotifications');
    if (storedNotifications) {
      try {
        const parsedNotifications = (JSON.parse(storedNotifications) as AppNotification[]).map(n => ({...n, timestamp: new Date(n.timestamp)}));
        setNotifications(parsedNotifications);
      } catch(e) {
        // ignore
      }
    } else {
        // Add some initial mock notifications
        setNotifications([
            { id: '1', message: 'Welcome to IoT Guardian!', type: 'system', read: false, timestamp: new Date(Date.now() - 1000 * 60 * 5) },
            { id: '2', message: 'Device "Living Room Sensor" reported high temperature.', type: 'arduino', read: true, timestamp: new Date(Date.now() - 1000 * 60 * 60) },
        ]);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('userNotifications', JSON.stringify(notifications));
  }, [notifications]);


  const loginUser = useCallback((userData: User) => {
    setCurrentUser({...userData, isLoggedIn: true});
  }, []);

  const logoutUser = useCallback(() => {
    setCurrentUser(MOCK_USER_LOGGED_OUT);
    localStorage.removeItem('currentUser');
    // Optionally redirect to login page
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
    setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep last 20 notifications
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
    return `${diffDays} day(s) remaining`;
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
