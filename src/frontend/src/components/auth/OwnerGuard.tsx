import { type ReactNode } from 'react';
import { useOwnerAuth } from '@/hooks/useOwnerAuth';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

interface OwnerGuardProps {
  children: ReactNode;
}

export default function OwnerGuard({ children }: OwnerGuardProps) {
  const { isAdmin, isLoading, error } = useOwnerAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (error || !isAdmin) {
    return (
      <div className="container py-16">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="mt-2">
            You don't have permission to access this area. Only administrators can view the owner dashboard.
          </AlertDescription>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate({ to: '/' })}
          >
            Return to Home
          </Button>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
