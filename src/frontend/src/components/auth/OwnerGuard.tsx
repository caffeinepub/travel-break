import { type ReactNode } from 'react';
import { useOwnerAuth } from '@/hooks/useOwnerAuth';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Loader2 } from 'lucide-react';
import AccessDeniedScreen from './AccessDeniedScreen';

interface OwnerGuardProps {
  children: ReactNode;
}

export default function OwnerGuard({ children }: OwnerGuardProps) {
  const { isAdmin, isLoading } = useOwnerAuth();
  const { identity } = useInternetIdentity();

  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen isAuthenticated={!!identity} />;
  }

  return <>{children}</>;
}
