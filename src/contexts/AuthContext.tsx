import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: User[] = [
  {
    id: 'pf-officer-1',
    email: 'pf@provincial.gov',
    full_name: 'Provincial Fund Officer',
    role: 'pf',
  },
  {
    id: 'cmb-member-1',
    email: 'cmb@community.org',
    full_name: 'CMB Member',
    role: 'cmb',
    commune_id: '11111111-1111-1111-1111-111111111111',
  },
  {
    id: 'viewer-1',
    email: 'viewer@example.com',
    full_name: 'Community Viewer',
    role: 'viewer',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('pf_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const foundUser = DEMO_USERS.find(u => u.email === email);

    if (!foundUser || password !== 'password123') {
      throw new Error('Invalid credentials');
    }

    setUser(foundUser);
    localStorage.setItem('pf_user', JSON.stringify(foundUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pf_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
