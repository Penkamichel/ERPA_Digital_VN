import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (name: string, role: UserRole, communityId: string, communityName: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: User[] = [
  {
    id: '1',
    name: 'Siriporn (CMB Coordinator)',
    role: 'CMB',
    communityId: 'ban-pho-village',
    communityName: 'Ban Pho Village',
  },
  {
    id: '2',
    name: 'Somchai (Community Member)',
    role: 'Community Member',
    communityId: 'ban-pho-village',
    communityName: 'Ban Pho Village',
  },
  {
    id: '3',
    name: 'Thawatchai (Forest Owner)',
    role: 'Forest Owner',
    communityId: 'ban-pho-village',
    communityName: 'Ban Pho Village',
  },
  {
    id: '4',
    name: 'Anan (CPC Representative)',
    role: 'CPC',
    communityId: 'ban-pho-village',
    communityName: 'Ban Pho Village',
  },
];

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  CMB: [
    'register_fund',
    'schedule_meeting',
    'upload_minutes',
    'create_plan',
    'create_budget',
    'upload_receipt',
    'upload_photo',
    'write_progress_note',
    'submit_report',
    'generate_final_report',
    'view_all',
  ],
  'Community Member': [
    'submit_idea',
    'view_ideas',
    'view_meetings',
    'view_minutes',
    'view_plan',
    'view_activities',
  ],
  'Forest Owner': [
    'view_plan',
    'add_comment',
    'view_activities',
    'view_budget',
  ],
  CPC: [
    'view_plan',
    'add_comment',
    'view_activities',
    'view_budget',
    'view_reports',
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('@user');
      if (userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const login = async (name: string, role: UserRole, communityId: string, communityName: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      role,
      communityId,
      communityName,
    };
    setUser(newUser);
    await AsyncStorage.setItem('@user', JSON.stringify(newUser));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('@user');
  };

  const hasPermission = (action: string): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(action) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export { DEMO_USERS };
