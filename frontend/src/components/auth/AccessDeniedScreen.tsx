import { AlertCircle, Home, LogIn } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';

interface AccessDeniedScreenProps {
  isAuthenticated?: boolean;
}

export default function AccessDeniedScreen({ isAuthenticated: isAuthenticatedProp }: AccessDeniedScreenProps) {
  const navigate = useNavigate();
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = isAuthenticatedProp ?? !!identity;

  return (
    <div className="container py-16 flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription className="text-base">
            {isAuthenticated
              ? 'You do not have permission to access the Admin Operations Dashboard'
              : 'Authentication required to access the Admin Operations Dashboard'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Administrator Access Required</AlertTitle>
            <AlertDescription className="mt-2">
              {isAuthenticated
                ? 'Your account does not have administrator privileges. Only authorized admin principals can access this area. If you believe you should have access, please contact your system administrator.'
                : 'You must be signed in with an administrator account to access this area. Please log in with an authorized principal to continue.'}
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="default" onClick={() => navigate({ to: '/' })} className="gap-2">
              <Home className="h-4 w-4" />
              Return to Home
            </Button>
            {!isAuthenticated && (
              <Button variant="outline" onClick={login} className="gap-2">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>
              {isAuthenticated
                ? 'Admin access is restricted to authorized principals only. Contact your administrator to request access.'
                : 'After signing in, you will be granted access if your principal has been authorized as an admin.'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
