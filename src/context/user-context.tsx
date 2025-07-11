
"use client";

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

// Keep the Subscription interface to define the shape of the subscription object
export interface Subscription {
  planName: string;
  expiryDate: string; 
  maxDevices: number;
  canControlDevice: boolean;
  canExportCsv: boolean;
  hasAutoShutdownFeature: boolean; 
  canAccessAiTroubleshooter: boolean;
}

// User interface now more closely mirrors the Firestore document
export interface User {
  id: string; // This will be the Firestore document ID (same as uid)
  uid: string; // Firebase Auth UID
  name: string; // Combined Full Name
  firstName: string;
  lastName: string;
  email: string;
  whatsappNumber: string;
  companyName: string;
  isLoggedIn: boolean;
  subscription: Subscription;
  status: 'pending' | 'active' | 'rejected';
  allowBluetoothControlFeatures: boolean;
  allowWaterLeakConfigFeatures: boolean;
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
  loginUser: (userData: User) => void; // Kept for manual login if needed, but flow changes
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
  uid: '',
  name: 'Guest',
  firstName: '',
  lastName: '',
  email: '',
  whatsappNumber: '',
  companyName: '',
  isLoggedIn: false,
  status: 'pending',
  allowBluetoothControlFeatures: false,
  allowWaterLeakConfigFeatures: false,
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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const userDocRef = doc(db, "users", firebaseUser.uid);
        
        // Set up a real-time listener for the user document
        const unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userDataFromDb = docSnap.data();

            if (userDataFromDb.status !== 'active') {
                // If user is not active, log them out from the app state
                signOut(auth); // Sign out from firebase auth
                setCurrentUser(MOCK_USER_LOGGED_OUT);
                setIsLoading(false);
                if (userDataFromDb.status === 'pending') {
                    toast({ title: "Account Pending", description: "Your account is still awaiting admin approval." });
                } else if (userDataFromDb.status === 'rejected') {
                    toast({ title: "Account Rejected", description: "Your account registration has been rejected by an administrator.", variant: "destructive" });
                }
                router.push('/auth/login');
                return;
            }

            const planName = userDataFromDb.subscription;
            const planDetails = PLAN_DETAILS[planName] || PLAN_DETAILS["None"];

            const userToSet: User = {
              id: docSnap.id,
              uid: firebaseUser.uid,
              isLoggedIn: true,
              name: `${userDataFromDb.firstName} ${userDataFromDb.lastName}`,
              firstName: userDataFromDb.firstName,
              lastName: userDataFromDb.lastName,
              email: userDataFromDb.email,
              whatsappNumber: userDataFromDb.whatsappNumber,
              companyName: userDataFromDb.companyName,
              status: userDataFromDb.status,
              allowBluetoothControlFeatures: userDataFromDb.allowBluetoothControlFeatures,
              allowWaterLeakConfigFeatures: userDataFromDb.allowWaterLeakConfigFeatures,
              subscription: {
                planName: planName,
                expiryDate: userDataFromDb.subscriptionExpiryDate || new Date().toISOString(),
                maxDevices: userDataFromDb.allowedDevices ?? planDetails.maxDevices ?? 0,
                canControlDevice: planDetails.canControlDevice ?? false,
                canExportCsv: planDetails.canExportCsv ?? false,
                hasAutoShutdownFeature: planDetails.hasAutoShutdownFeature ?? false,
                canAccessAiTroubleshooter: planDetails.canAccessAiTroubleshooter ?? false,
              },
            };
            setCurrentUser(userToSet);
          } else {
            // User exists in Auth but not in Firestore, treat as an error/logged out state
            signOut(auth);
            setCurrentUser(MOCK_USER_LOGGED_OUT);
          }
          setIsLoading(false);
        });
        return () => unsubscribeDoc(); // Cleanup the doc listener when auth state changes

      } else {
        // User is signed out
        setCurrentUser(MOCK_USER_LOGGED_OUT);
        setIsLoading(false);
      }
    });

    // Notifications logic remains the same (can be enhanced with Firestore later)
    const storedNotifications = localStorage.getItem(LOCAL_STORAGE_KEY_NOTIFICATIONS);
    if (storedNotifications) {
      try {
        const parsedNotifications = (JSON.parse(storedNotifications) as AppNotification[]).map(n => ({...n, timestamp: new Date(n.timestamp)}));
        setNotifications(parsedNotifications);
      } catch(e) { /* ignore */ }
    } else {
        setNotifications([]);
    }

    return () => unsubscribeAuth(); // Cleanup the auth listener on component unmount
  }, [router, toast]);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  // This function can be deprecated or used for specific manual login flows if any
  const loginUser = useCallback((userData: User) => {
    setCurrentUser(userData);
  }, []);

  const logoutUser = useCallback(async () => {
    await signOut(auth);
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
