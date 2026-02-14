import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppShell from './components/layout/AppShell';
import HotelBookingPage from './pages/HotelBookingPage';
import CabBookingPage from './pages/CabBookingPage';
import ActingDriverBookingPage from './pages/ActingDriverBookingPage';
import SalesStorePage from './pages/SalesStorePage';
import CustomerCarePage from './pages/CustomerCarePage';
import PaymentReceivingPage from './pages/PaymentReceivingPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import HomePage from './pages/HomePage';

const rootRoute = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const hotelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hotel',
  component: HotelBookingPage,
});

const cabRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cab',
  component: CabBookingPage,
});

const driverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/driver',
  component: ActingDriverBookingPage,
});

const storeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/store',
  component: SalesStorePage,
});

const customerCareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customer-care',
  component: CustomerCarePage,
});

const paymentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment',
  component: PaymentReceivingPage,
});

const ownerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner',
  component: OwnerDashboardPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: OrderHistoryPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  hotelRoute,
  cabRoute,
  driverRoute,
  storeRoute,
  customerCareRoute,
  paymentRoute,
  ownerRoute,
  ordersRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
