import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppShell from './components/layout/AppShell';
import HotelBookingPage from './pages/HotelBookingPage';
import HotelReviewsPage from './pages/HotelReviewsPage';
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

const hotelReviewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hotel-reviews',
  component: HotelReviewsPage,
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

const ownerDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/owner-dashboard',
  component: OwnerDashboardPage,
});

const orderHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order-history',
  component: OrderHistoryPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  hotelRoute,
  hotelReviewsRoute,
  cabRoute,
  driverRoute,
  storeRoute,
  customerCareRoute,
  paymentRoute,
  ownerDashboardRoute,
  orderHistoryRoute,
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
