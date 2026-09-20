'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SessionUser, EmployeeRole, Permission } from '@/lib/auth/types';
import { hasPermission } from '@/lib/auth/permissions';

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  login: (employeeId: string, password: string) => Promise<{ success: boolean; error?: string; retryAfterSeconds?: number }>;
  logout: () => Promise<void>;
  hasRole: (role: EmployeeRole) => boolean;
  hasPerm: (permission: Permission) => boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
  hasRole: () => false,
  hasPerm: () => false,
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Session refresh check failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const login = async (employeeId: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Authentication failed. Please check your credentials.',
          retryAfterSeconds: data.retryAfterSeconds,
        };
      }

      setUser(data.user);
      router.refresh();
      return { success: true };
    } catch (err) {
      console.error('Login request error:', err);
      return {
        success: false,
        error: 'Unable to connect to authentication server. Please check your network connection.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: EmployeeRole) => {
    return user?.role === role;
  };

  const hasPerm = (permission: Permission) => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasRole,
        hasPerm,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
