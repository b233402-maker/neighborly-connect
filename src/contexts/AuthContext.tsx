// Auth context with subscription management
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { toast } from 'sonner';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  karma: number;
  verified: boolean;
  is_pro: boolean;
  is_banned: boolean;
  lat: number | null;
  lng: number | null;
  privacy_level: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error('Profile fetch failed:', err);
      return null;
    }
  }, []);

  const checkAdminRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: userId,
        _role: 'admin',
      });
      if (!error) setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
  }, []);

  const checkSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) {
        console.error('Subscription check failed:', error);
        return;
      }
      // The edge function syncs is_pro in the DB, so re-fetch profile
      if (data?.subscribed !== undefined) {
        // Profile will be refreshed after this
        return data.subscribed as boolean;
      }
    } catch (err) {
      console.error('Subscription check error:', err);
    }
    return undefined;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const p = await fetchProfile(user.id);
    if (p) setProfile(p);
  }, [user, fetchProfile]);

  // Set up auth listener BEFORE checking session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Defer profile fetch to avoid Supabase deadlock
          setTimeout(async () => {
            const p = await fetchProfile(newSession.user.id);
            if (p) {
              if (p.is_banned) {
                toast.error('Your account has been suspended. Please contact support.');
                await supabase.auth.signOut();
                setUser(null);
                setSession(null);
                setProfile(null);
                setIsLoading(false);
                return;
              }
              setProfile(p);
            }
            await checkAdminRole(newSession.user.id);
            setIsLoading(false);
            // Check subscription in background (syncs is_pro)
            checkSubscription().then(async (subscribed) => {
              if (subscribed !== undefined) {
                const refreshed = await fetchProfile(newSession.user.id);
                if (refreshed) setProfile(refreshed);
              }
            });
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (existingSession?.user) {
        setSession(existingSession);
        setUser(existingSession.user);
        fetchProfile(existingSession.user.id).then(p => {
          if (p) setProfile(p);
          checkAdminRole(existingSession.user.id).then(() => setIsLoading(false));
          // Check subscription
          checkSubscription().then(async (subscribed) => {
            if (subscribed !== undefined) {
              const refreshed = await fetchProfile(existingSession.user.id);
              if (refreshed) setProfile(refreshed);
            }
          });
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, checkAdminRole, checkSubscription]);

  // Periodic subscription check every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(async () => {
      const subscribed = await checkSubscription();
      if (subscribed !== undefined) {
        const p = await fetchProfile(user.id);
        if (p) setProfile(p);
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [user, checkSubscription, fetchProfile]);

  // Check subscription on URL params (returning from Stripe checkout)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('subscription') === 'success' && user) {
      // Delay to give Stripe time to process
      setTimeout(async () => {
        await checkSubscription();
        const p = await fetchProfile(user.id);
        if (p) {
          setProfile(p);
          if (p.is_pro) toast.success('🎉 Welcome to Pro Neighbor! Your subscription is active.');
        }
      }, 2000);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user, checkSubscription, fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error('Google sign-in failed. Please try again.');
        setIsLoading(false);
      }
    } catch {
      toast.error('Google sign-in failed. Please try again.');
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
    } else {
      toast.success('Check your email to verify your account!');
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    toast.success('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isAuthenticated: !!session,
        isLoading,
        isAdmin,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
