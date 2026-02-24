import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, Home, History, User } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';

export default function HeaderNav() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const handleNavigation = (path: string) => {
    navigate({ to: path });
    setMobileMenuOpen(false);
  };

  const serviceLinks = [
    { label: 'Hotel Booking', path: '/hotel' },
    { label: 'Cab Booking', path: '/cab' },
    { label: 'Acting Driver', path: '/driver' },
    { label: 'Sales Store', path: '/store' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavigation('/')}>
          <img
            src="/assets/generated/travel-break-logo-round.dim_256x256.png"
            alt="Travel Break"
            className="h-10 w-10 rounded-full"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
            Travel Break
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Button variant="ghost" onClick={() => handleNavigation('/')} className="gap-2">
            <Home className="h-4 w-4" />
            Home
          </Button>
          {isAuthenticated && (
            <Button variant="ghost" onClick={() => handleNavigation('/order-history')} className="gap-2">
              <History className="h-4 w-4" />
              Order History
            </Button>
          )}
          {serviceLinks.map((link) => (
            <Button key={link.path} variant="ghost" onClick={() => handleNavigation(link.path)}>
              {link.label}
            </Button>
          ))}
          <Button variant="outline" onClick={() => setAuthModalOpen(true)} className="gap-2">
            <User className="h-4 w-4" />
            {isAuthenticated ? 'Account' : 'Sign In'}
          </Button>
        </nav>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setAuthModalOpen(true)}>
            <User className="h-4 w-4" />
          </Button>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                <Button variant="ghost" onClick={() => handleNavigation('/')} className="justify-start gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Button>
                {isAuthenticated && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation('/order-history')}
                      className="justify-start gap-2"
                    >
                      <History className="h-4 w-4" />
                      Order History
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation('/customer-care')}
                      className="justify-start"
                    >
                      Support
                    </Button>
                    <Button variant="ghost" onClick={() => handleNavigation('/payment')} className="justify-start">
                      Payment
                    </Button>
                  </>
                )}
                <div className="my-2 border-t" />
                {serviceLinks.map((link) => (
                  <Button key={link.path} variant="ghost" onClick={() => handleNavigation(link.path)} className="justify-start">
                    {link.label}
                  </Button>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </header>
  );
}
