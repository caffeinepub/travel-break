import { type ReactNode } from 'react';
import HeaderNav from './HeaderNav';
import Footer from './Footer';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HeaderNav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
