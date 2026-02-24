import { useState } from 'react';
import OwnerGuard, { useOwnerSession } from '@/components/auth/OwnerGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Hotel, Car, UserCircle, ShoppingBag, MessageSquare, CreditCard, LogOut } from 'lucide-react';
import {
  useGetAllHotelBookings,
  useGetAllCabBookings,
  useGetAllActingDriverRequests,
  useGetAllSalesOrders,
  useGetAllInquiries,
  useGetAllPayments,
  useUpdateHotelBookingStatus,
  useUpdateCabBookingStatus,
  useUpdateActingDriverRequestStatus,
  useUpdateInquiryStatus,
  useUpdatePaymentStatus,
} from '@/hooks/useOwnerRecords';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { BookingStatus, Variant_new_closed_reviewed, Variant_new_verified_rejected } from '@/backend';
import AdminKpiCards from '@/components/admin/AdminKpiCards';
import RecentActivityFeed from '@/components/admin/RecentActivityFeed';
import StatusSelect from '@/components/admin/StatusSelect';
import AdminManagementSection from '@/components/admin/AdminManagementSection';
import OrderManagementSection from '@/components/admin/OrderManagementSection';
import HotelManagementSection from '@/components/admin/HotelManagementSection';
import CabManagementSection from '@/components/admin/CabManagementSection';

export default function OwnerDashboardPage() {
  return (
    <OwnerGuard>
      <DashboardContent />
    </OwnerGuard>
  );
}

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const { logout } = useOwnerSession();

  const { data: hotelBookings = [] } = useGetAllHotelBookings();
  const { data: cabBookings = [] } = useGetAllCabBookings();
  const { data: driverRequests = [] } = useGetAllActingDriverRequests();
  const { data: salesOrders = [] } = useGetAllSalesOrders();
  const { data: inquiries = [] } = useGetAllInquiries();
  const { data: payments = [] } = useGetAllPayments();

  const updateHotelStatus = useUpdateHotelBookingStatus();
  const updateCabStatus = useUpdateCabBookingStatus();
  const updateDriverStatus = useUpdateActingDriverRequestStatus();
  const updateInquiryStatus = useUpdateInquiryStatus();
  const updatePaymentStatus = useUpdatePaymentStatus();

  const handleHotelStatusChange = async (bookingId: string, status: BookingStatus, roomType: string) => {
    await updateHotelStatus.mutateAsync({ bookingId, status, roomType });
  };

  const handleCabStatusChange = async (bookingId: string, status: BookingStatus, cabType: string) => {
    await updateCabStatus.mutateAsync({ bookingId, status, cabType });
  };

  const handleDriverStatusChange = async (requestId: string, status: BookingStatus) => {
    await updateDriverStatus.mutateAsync({ requestId, status });
  };

  const handleInquiryStatusChange = async (inquiryId: string, status: Variant_new_closed_reviewed) => {
    await updateInquiryStatus.mutateAsync({ inquiryId, status });
  };

  const handlePaymentStatusChange = async (paymentId: string, status: Variant_new_verified_rejected) => {
    await updatePaymentStatus.mutateAsync({ paymentId, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'verified':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Confirmed</Badge>;
      case 'pending':
      case 'new':
      case 'new_':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
      case 'rejected':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'reviewed':
        return <Badge variant="outline">Reviewed</Badge>;
      case 'closed':
        return <Badge>Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Prepare stats for KPI cards
  const stats = [
    { label: 'Hotel Bookings', value: hotelBookings.length, icon: Hotel, color: 'text-sky-500' },
    { label: 'Cab Bookings', value: cabBookings.length, icon: Car, color: 'text-green-500' },
    { label: 'Driver Requests', value: driverRequests.length, icon: UserCircle, color: 'text-cyan-500' },
    { label: 'Sales Orders', value: salesOrders.length, icon: ShoppingBag, color: 'text-orange-500' },
    { label: 'Inquiries', value: inquiries.length, icon: MessageSquare, color: 'text-red-500' },
    { label: 'Payments', value: payments.length, icon: CreditCard, color: 'text-blue-500' },
  ];

  // Prepare activities for recent activity feed
  const activities = [
    ...hotelBookings.map(b => ({
      type: 'hotel' as const,
      id: b.bookingId,
      timestamp: Number(b.bookingDate),
      timestampBigInt: b.bookingDate,
      status: b.status,
      data: b,
    })),
    ...cabBookings.map(b => ({
      type: 'cab' as const,
      id: b.bookingId,
      timestamp: Number(b.bookingDate),
      timestampBigInt: b.bookingDate,
      status: b.status,
      data: b,
    })),
    ...driverRequests.map(r => ({
      type: 'driver' as const,
      id: r.requestId,
      timestamp: Number(r.bookingDate),
      timestampBigInt: r.bookingDate,
      status: r.status,
      data: r,
    })),
    ...salesOrders.map(o => ({
      type: 'order' as const,
      id: o.orderId,
      timestamp: Number(o.orderDate),
      timestampBigInt: o.orderDate,
      status: o.status,
      data: o,
    })),
    ...inquiries.map(i => ({
      type: 'inquiry' as const,
      id: i.inquiryId,
      timestamp: Number(i.timestamp),
      timestampBigInt: i.timestamp,
      status: i.status,
      data: i,
    })),
    ...payments.map(p => ({
      type: 'payment' as const,
      id: p.paymentId,
      timestamp: Number(p.timestamp),
      timestampBigInt: p.timestamp,
      status: p.status,
      data: p,
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const bookingStatusOptions = [
    { value: BookingStatus.pending, label: 'Pending' },
    { value: BookingStatus.confirmed, label: 'Confirmed' },
    { value: BookingStatus.cancelled, label: 'Cancelled' },
  ];

  const inquiryStatusOptions = [
    { value: Variant_new_closed_reviewed.new_, label: 'New' },
    { value: Variant_new_closed_reviewed.reviewed, label: 'Reviewed' },
    { value: Variant_new_closed_reviewed.closed, label: 'Closed' },
  ];

  const paymentStatusOptions = [
    { value: Variant_new_verified_rejected.new_, label: 'New' },
    { value: Variant_new_verified_rejected.verified, label: 'Verified' },
    { value: Variant_new_verified_rejected.rejected, label: 'Rejected' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-7xl">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Owner Dashboard</h1>
            <p className="text-muted-foreground">Manage all bookings, orders, and customer interactions</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex items-center gap-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="hotel-mgmt">Hotels</TabsTrigger>
            <TabsTrigger value="cab-mgmt">Cabs</TabsTrigger>
            <TabsTrigger value="hotel-bookings">Bookings</TabsTrigger>
            <TabsTrigger value="cab-bookings">Cab Trips</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <AdminKpiCards stats={stats} />
            <RecentActivityFeed activities={activities} />
          </TabsContent>

          {/* Hotel Management Tab */}
          <TabsContent value="hotel-mgmt">
            <HotelManagementSection />
          </TabsContent>

          {/* Cab Management Tab */}
          <TabsContent value="cab-mgmt">
            <CabManagementSection />
          </TabsContent>

          {/* Hotel Bookings Tab */}
          <TabsContent value="hotel-bookings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Hotel Bookings
                </CardTitle>
                <CardDescription>Manage hotel room reservations</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {hotelBookings.map((booking) => (
                      <Card key={booking.bookingId}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{booking.roomType}</p>
                                {getStatusBadge(booking.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Guest: {booking.guest.toString().slice(0, 20)}...
                              </p>
                              <p className="text-sm">
                                Check-in: {formatDateTime(booking.checkInDate)} | Check-out: {formatDateTime(booking.checkOutDate)}
                              </p>
                              <p className="text-sm font-medium">{formatCurrency(booking.totalPrice)}</p>
                            </div>
                            <StatusSelect
                              value={booking.status}
                              onValueChange={(status) => handleHotelStatusChange(booking.bookingId, status as BookingStatus, booking.roomType)}
                              disabled={updateHotelStatus.isPending}
                              options={bookingStatusOptions}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cab Bookings Tab */}
          <TabsContent value="cab-bookings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Cab Bookings
                </CardTitle>
                <CardDescription>Manage cab reservations</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {cabBookings.map((booking) => (
                      <Card key={booking.bookingId}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{booking.cabType}</p>
                                {getStatusBadge(booking.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Guest: {booking.guest.toString().slice(0, 20)}...
                              </p>
                              <p className="text-sm">
                                From: {booking.pickupLocation} → To: {booking.dropoffLocation}
                              </p>
                              <p className="text-sm">Pickup: {formatDateTime(booking.pickupTime)}</p>
                              <p className="text-sm font-medium">{formatCurrency(booking.totalPrice)}</p>
                            </div>
                            <StatusSelect
                              value={booking.status}
                              onValueChange={(status) => handleCabStatusChange(booking.bookingId, status as BookingStatus, booking.cabType)}
                              disabled={updateCabStatus.isPending}
                              options={bookingStatusOptions}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Acting Driver Requests Tab */}
          <TabsContent value="drivers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  Acting Driver Requests
                </CardTitle>
                <CardDescription>Manage acting driver service requests</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {driverRequests.map((request) => (
                      <Card key={request.requestId}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{request.vehicleType}</p>
                                {getStatusBadge(request.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Guest: {request.guest.toString().slice(0, 20)}...
                              </p>
                              <p className="text-sm">Service Date: {formatDateTime(request.serviceDate)}</p>
                              <p className="text-sm">{request.serviceDetails}</p>
                            </div>
                            <StatusSelect
                              value={request.status}
                              onValueChange={(status) => handleDriverStatusChange(request.requestId, status as BookingStatus)}
                              disabled={updateDriverStatus.isPending}
                              options={bookingStatusOptions}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Orders Tab */}
          <TabsContent value="orders">
            <OrderManagementSection />
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Customer Inquiries
                </CardTitle>
                <CardDescription>Manage customer support inquiries</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                      <Card key={inquiry.inquiryId}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                {getStatusBadge(inquiry.status)}
                                <p className="text-sm text-muted-foreground">
                                  {formatDateTime(inquiry.timestamp)}
                                </p>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Customer: {inquiry.customer.toString().slice(0, 20)}...
                              </p>
                              <p className="text-sm">{inquiry.message}</p>
                              <p className="text-sm font-medium">Contact: {inquiry.contactInfo}</p>
                            </div>
                            <StatusSelect
                              value={inquiry.status}
                              onValueChange={(status) => handleInquiryStatusChange(inquiry.inquiryId, status as Variant_new_closed_reviewed)}
                              disabled={updateInquiryStatus.isPending}
                              options={inquiryStatusOptions}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Records
                </CardTitle>
                <CardDescription>Manage customer payment submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <Card key={payment.paymentId}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">Ref: {payment.reference}</p>
                                {getStatusBadge(payment.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Customer: {payment.customer.toString().slice(0, 20)}...
                              </p>
                              <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                              {payment.note && <p className="text-sm">{payment.note}</p>}
                              <p className="text-sm text-muted-foreground">{formatDateTime(payment.timestamp)}</p>
                            </div>
                            <StatusSelect
                              value={payment.status}
                              onValueChange={(status) => handlePaymentStatusChange(payment.paymentId, status as Variant_new_verified_rejected)}
                              disabled={updatePaymentStatus.isPending}
                              options={paymentStatusOptions}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Management Tab */}
          <TabsContent value="admin">
            <AdminManagementSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
