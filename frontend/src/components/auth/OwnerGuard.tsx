import { type ReactNode } from 'react';
import { useAdminSession } from '@/hooks/useAdminSession';
import AdminLoginForm from './AdminLoginForm';

interface OwnerGuardProps {
  children: ReactNode;
  onLogout?: () => void;
}

export default function OwnerGuard({ children, onLogout }: OwnerGuardProps) {
  const { isAuthenticated, isLoading, error, login, logout } = useAdminSession();

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  if (!isAuthenticated) {
    return (
      <AdminLoginForm
        onLogin={login}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // Pass logout handler down via a context-like prop pattern
  // We clone children and inject logout if it's a single React element
  return (
    <OwnerSessionContext.Provider value={{ logout: handleLogout }}>
      {children}
    </OwnerSessionContext.Provider>
  );
}

// Simple context for passing logout to dashboard
import { createContext, useContext } from 'react';

interface OwnerSessionContextValue {
  logout: () => void;
}

const OwnerSessionContext = createContext<OwnerSessionContextValue>({
  logout: () => {},
});

export function useOwnerSession() {
  return useContext(OwnerSessionContext);
}
