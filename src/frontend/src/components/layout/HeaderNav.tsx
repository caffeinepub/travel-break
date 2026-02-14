import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Menu, X, Hotel, Car, UserCircle, ShoppingBag, HeadphonesIcon, CreditCard, LayoutDashboard, Home, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AuthModal from '../auth/AuthModal';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useOwnerAuth } from '@/hooks/useOwnerAuth';
import { Separator } from '@/components/ui/separator';

export default function HeaderNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const { isAdmin } = useOwnerAuth();
  const navigate = useNavigate();

  const isAuthenticated = !!identity;

  const navLinks = [
    { to: '/hotel', label: 'Hotels & Stays', icon: Hotel },
    { to: '/cab', label: 'Cab Booking', icon: Car },
    { to: '/driver', label: 'Acting Driver', icon: UserCircle },
    { to: '/store', label: 'Store', icon: ShoppingBag },
    { to: '/customer-care', label: 'Support', icon: HeadphonesIcon },
    { to: '/payment', label: 'Payment', icon: CreditCard },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center space-x-2">
                <div className="flex items-center gap-2">
                  <img 
                    src="/assets/generated/travel-break-logo-round.dim_256x256.png" 
                    alt="Travel Break Logo" 
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
                    Travel Break
                  </span>
                </div>
              </Link>
              
              <Link to="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  aria-label="Home"
                >
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </Button>
              </Link>

              <Link to="/order-history">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  aria-label="Order History"
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">Order History</span>
                </Button>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className="gap-2"
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: '/owner-dashboard' })}
                className="hidden md:flex gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            )}
            
            <Button
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
              onClick={() => setAuthModalOpen(true)}
              className="hidden md:flex"
            >
              {isAuthenticated ? 'My Account' : 'Sign In'}
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link to="/" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                    >
                      <Home className="h-4 w-4" />
                      Home
                    </Button>
                  </Link>

                  <Button
                    variant={isAuthenticated ? 'outline' : 'default'}
                    onClick={() => {
                      setMobileOpen(false);
                      setAuthModalOpen(true);
                    }}
                    className="w-full"
                  >
                    {isAuthenticated ? 'My Account' : 'Sign In'}
                  </Button>

                  <Link to="/order-history" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                    >
                      <History className="h-4 w-4" />
                      Order History
                    </Button>
                  </Link>

                  <Link to="/customer-care" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                    >
                      <HeadphonesIcon className="h-4 w-4" />
                      Support
                    </Button>
                  </Link>

                  <Link to="/payment" onClick={() => setMobileOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                    >
                      <CreditCard className="h-4 w-4" />
                      Payment
                    </Button>
                  </Link>

                  <Separator />

                  {navLinks.map((link) => (
                    <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}>
                      {({ isActive }) => (
                        <Button
                          variant={isActive ? 'default' : 'ghost'}
                          className="w-full justify-start gap-2"
                        >
                          <link.icon className="h-4 w-4" />
                          {link.label}
                        </Button>
                      )}
                    </Link>
                  ))}
                  
                  {isAuthenticated && isAdmin && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setMobileOpen(false);
                        navigate({ to: '/owner-dashboard' });
                      }}
                      className="w-full justify-start gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}
