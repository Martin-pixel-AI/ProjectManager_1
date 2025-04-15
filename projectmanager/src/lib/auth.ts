'use client';

import { useCurrentUser } from './useCurrentUser';
import { redirect } from 'next/navigation';
import { useEffect, ReactElement } from 'react';

// Утилита для защиты страниц, требующих авторизации
export function withAuth<P extends {}>(Component: React.ComponentType<P>) {
  return function AuthProtected(props: P): ReactElement | null {
    const { user, isLoading, isAuthenticated } = useCurrentUser();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        redirect('/auth/login');
      }
    }, [isLoading, isAuthenticated]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} user={user} />;
  };
}

// Утилита для защиты страниц, требующих прав администратора
export function withAdminAuth<P extends {}>(Component: React.ComponentType<P>) {
  return function AdminProtected(props: P): ReactElement | null {
    const { user, isLoading, isAuthenticated } = useCurrentUser();

    useEffect(() => {
      if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
        redirect('/auth/login');
      }
    }, [isLoading, isAuthenticated, user]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated || user?.role !== 'admin') {
      return null;
    }

    return <Component {...props} user={user} />;
  };
} 