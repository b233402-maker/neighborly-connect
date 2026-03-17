import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: 'email' | 'google';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DUMMY_USERS: Record<string, { password: string; user: User }> = {
  'demo@neighborly.app': {
    password: 'demo123',
    user: {
      id: 'u1',
      name: 'Rahim Ahmed',
      email: 'demo@neighborly.app',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahim',
      provider: 'email',
    },
  },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('neighborly_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const entry = DUMMY_USERS[email.toLowerCase()];
    if (entry && entry.password === password) {
      setUser(entry.user);
      localStorage.setItem('neighborly_user', JSON.stringify(entry.user));
      toast.success(`Welcome back, ${entry.user.name}!`);
    } else {
      // Auto-register for any email/password combo in dummy mode
      const newUser: User = {
        id: `u_${Date.now()}`,
        name: email.split('@')[0],
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        provider: 'email',
      };
      DUMMY_USERS[email.toLowerCase()] = { password, user: newUser };
      setUser(newUser);
      localStorage.setItem('neighborly_user', JSON.stringify(newUser));
      toast.success(`Welcome, ${newUser.name}!`);
    }
    setIsLoading(false);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const googleUser: User = {
      id: 'g_' + Date.now(),
      name: 'Google User',
      email: 'user@gmail.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Google',
      provider: 'google',
    };
    setUser(googleUser);
    localStorage.setItem('neighborly_user', JSON.stringify(googleUser));
    toast.success('Signed in with Google!');
    setIsLoading(false);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    if (DUMMY_USERS[email.toLowerCase()]) {
      toast.error('Email already registered. Try logging in.');
      setIsLoading(false);
      return;
    }
    const newUser: User = {
      id: `u_${Date.now()}`,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      provider: 'email',
    };
    DUMMY_USERS[email.toLowerCase()] = { password, user: newUser };
    setUser(newUser);
    localStorage.setItem('neighborly_user', JSON.stringify(newUser));
    toast.success(`Welcome to Neighborly, ${name}!`);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('neighborly_user');
    toast.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, loginWithGoogle, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
