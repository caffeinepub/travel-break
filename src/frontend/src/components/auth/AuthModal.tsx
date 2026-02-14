import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOut, Loader2, History, HeadphonesIcon, CreditCard } from 'lucide-react';
import { SiGoogle } from 'react-icons/si';
import ProfileSetupModal from './ProfileSetupModal';
import { useGetCallerUserProfile } from '@/hooks/useQueries';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from '@tanstack/react-router';
import { Separator } from '@/components/ui/separator';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [showGoogleMessage, setShowGoogleMessage] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      onOpenChange(false);
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleGoogleClick = () => {
    setShowGoogleMessage(true);
  };

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    navigate({ to: path });
  };

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isAuthenticated ? 'Account' : 'Sign In to Travel Break'}</DialogTitle>
            <DialogDescription>
              {isAuthenticated
                ? 'Manage your Travel Break account'
                : 'Choose a sign-in method to access all features'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {isAuthenticated && identity && (
              <>
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <p className="text-sm font-medium mb-1">Signed in as:</p>
                  <p className="text-xs text-muted-foreground font-mono break-all">
                    {identity.getPrincipal().toString()}
                  </p>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleNavigate('/order-history')}
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <History className="h-4 w-4" />
                    Order History
                  </Button>

                  <Button
                    onClick={() => handleNavigate('/customer-care')}
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <HeadphonesIcon className="h-4 w-4" />
                    Support
                  </Button>

                  <Button
                    onClick={() => handleNavigate('/payment')}
                    variant="outline"
                    className="w-full justify-start gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Payment
                  </Button>
                </div>

                <Separator />
              </>
            )}

            {!isAuthenticated && (
              <>
                {showGoogleMessage && (
                  <Alert>
                    <AlertDescription>
                      Google Sign-In is not available in this build. Please use the Internet Identity sign-in button below to access your account.
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleGoogleClick}
                  disabled={false}
                  variant="outline"
                  className="w-full"
                >
                  <SiGoogle className="mr-2 h-4 w-4" />
                  Continue with Google (Gmail)
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>
              </>
            )}

            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              className="w-full"
              variant={isAuthenticated ? 'destructive' : 'default'}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : isAuthenticated ? (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In with Internet Identity
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ProfileSetupModal open={showProfileSetup} />
    </>
  );
}
