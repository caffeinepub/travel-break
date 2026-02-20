import { useState } from 'react';
import OwnerGuard from '@/components/auth/OwnerGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Hotel, Car, UserCircle, ShoppingBag, MessageSquare, CreditCard } from 'lucide-react';
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
  useUpdateSalesOrderStatus,
  useUpdateInquiryStatus,
  useUpdatePaymentStatus,
} from '@/hooks/useOwnerRecords';
import { formatDate, formatDateTime, formatCurrency } from '@/utils/format';
import { BookingStatus, Variant_new_closed_reviewed, Variant_new_verified_rejected } from '../backend';
import { toast } from 'sonner';
import AdminKpiCards from '@/components/admin/AdminKpiCards';
import RecentActivityFeed from '@/components/admin/RecentActivityFeed';
import StatusSelect from '@/components/admin/StatusSelect';
import AdminManagementSection from '@/components/admin/AdminManagementSection';

export default function OwnerDashboardPage() {
  return (
    <OwnerGuard>
      <DashboardContent />
    </OwnerGuard>
  );
}

function DashboardContent() {
  const { data: hotelBookings = [] } = useGetAllHotelBookings();
  const { data: cabBookings = [] } = useGetAllCabBookings();
  const { data: driverRequests = [] } = useGetAllActingDriverRequests();
  const { data: salesOrders = [] } = useGetAllSalesOrders();
  const { data: inquiries = [] } = useGetAllInquiries();
  const { data: payments = [] } = useGetAllPayments();

  const updateHotelStatus = useUpdateHotelBookingStatus();
  const updateCabStatus = useUpdateCabBookingStatus();
  const updateDriverStatus = useUpdateActingDriverRequestStatus();
  const updateOrderStatus = useUpdateSalesOrderStatus();
  const updateInquiryStatus = useUpdateInquiryStatus();
  const updatePaymentStatus = useUpdatePaymentStatus();

  const [selectedTab, setSelectedTab] = useState('overview');

  const stats = [
    { label: 'Hotel Bookings', value: hotelBookings.length, icon: Hotel, color: 'text-sky-500' },
    { label: 'Cab Bookings', value: cabBookings.length, icon: Car, color: 'text-green-500' },
    { label: 'Driver Requests', value: driverRequests.length, icon: UserCircle, color: 'text-cyan-500' },
    { label: 'Sales Orders', value: salesOrders.length, icon: ShoppingBag, color: 'text-orange-500' },
    { label: 'Inquiries', value: inquiries.length, icon: MessageSquare, color: 'text-red-500' },
    { label: 'Payments', value: payments.length, icon: CreditCard, color: 'text-blue-500' },
  ];

  // Create a unified activity feed sorted by timestamp descending
  const recentActivities = [
    ...hotelBookings.map((b) => ({
      type: 'hotel' as const,
      id: b.bookingId,
      timestamp: Number(b.bookingDate),
      timestampBigInt: b.bookingDate,
      status: b.status,
      data: b,
    })),
    ...cabBookings.map((b) => ({
      type: 'cab' as const,
      id: b.bookingId,
      timestamp: Number(b.bookingDate),
      timestampBigInt: b.bookingDate,
      status: b.status,
      data: b,
    })),
    ...driverRequests.map((r) => ({
      type: 'driver' as const,
      id: r.requestId,
      timestamp: Number(r.bookingDate),
      timestampBigInt: r.bookingDate,
      status: r.status,
      data: r,
    })),
    ...salesOrders.map((o) => ({
      type: 'order' as const,
      id: o.orderId,
      timestamp: Number(o.orderDate),
      timestampBigInt: o.orderDate,
      status: o.status,
      data: o,
    })),
    ...inquiries.map((i) => ({
      type: 'inquiry' as const,
      id: i.inquiryId,
      timestamp: Number(i.timestamp),
      timestampBigInt: i.timestamp,
      status: i.status,
      data: i,
    })),
    ...payments.map((p) => ({
      type: 'payment' as const,
      id: p.paymentId,
      timestamp: Number(p.timestamp),
      timestampBigInt: p.timestamp,
      status: p.status,
      data: p,
    })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 15);

  const handleHotelStatusChange = async (bookingId: string, status: string, roomType: string) => {
    try {
      await updateHotelStatus.mutateAsync({ bookingId, status: status as BookingStatus, roomType });
      toast.success('Hotel booking status updated successfully');
    } catch (error) {
      toast.error('Failed to update hotel booking status');
      console.error(error);
    }
  };

  const handleCabStatusChange = async (bookingId: string, status: string, cabType: string) => {
    try {
      await updateCabStatus.mutateAsync({ bookingId, status: status as BookingStatus, cabType });
      toast.success('Cab booking status updated successfully');
    } catch (error) {
      toast.error('Failed to update cab booking status');
      console.error(error);
    }
  };

  const handleDriverStatusChange = async (requestId: string, status: string) => {
    try {
      await updateDriverStatus.mutateAsync({ requestId, status: status as BookingStatus });
      toast.success('Driver request status updated successfully');
    } catch (error) {
      toast.error('Failed to update driver request status');
      console.error(error);
    }
  };

  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: status as BookingStatus });
      toast.success('Sales order status updated successfully');
    } catch (error) {
      toast.error('Failed to update sales order status');
      console.error(error);
    }
  };

  const handleInquiryStatusChange = async (inquiryId: string, status: string) => {
    try {
      await updateInquiryStatus.mutateAsync({ inquiryId, status: status as Variant_new_closed_reviewed });
      toast.success('Inquiry status updated successfully');
    } catch (error) {
      toast.error('Failed to update inquiry status');
      console.error(error);
    }
  };

  const handlePaymentStatusChange = async (paymentId: string, status: string) => {
    try {
      await updatePaymentStatus.mutateAsync({ paymentId, status: status as Variant_new_verified_rejected });
      toast.success('Payment status updated successfully');
    } catch (error) {
      toast.error('Failed to update payment status');
      console.error(error);
    }
  };

  const getInquiryStatusLabel = (status: Variant_new_closed_reviewed): string => {
    if (status === Variant_new_closed_reviewed.new_) return 'New';
    if (status === Variant_new_closed_reviewed.reviewed) return 'Reviewed';
    if (status === Variant_new_closed_reviewed.closed) return 'Closed';
    return status;
  };

  const getPaymentStatusLabel = (status: Variant_new_verified_rejected): string => {
    if (status === Variant_new_verified_rejected.new_) return 'New';
    if (status === Variant_new_verified_rejected.verified) return 'Verified';
    if (status === Variant_new_verified_rejected.rejected) return 'Rejected';
    return status;
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Admin Operations Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Manage all bookings, orders, inquiries, and payments from one central location
        </p>
      </div>

      {/* KPI Cards */}
      <AdminKpiCards stats={stats} />

      {/* Tabs for different sections */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="hotels" className="text-xs sm:text-sm">
            Hotels
          </TabsTrigger>
          <TabsTrigger value="cabs" className="text-xs sm:text-sm">
            Cabs
          </TabsTrigger>
          <TabsTrigger value="drivers" className="text-xs sm:text-sm">
            Drivers
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs sm:text-sm">
            Orders
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="text-xs sm:text-sm">
            Inquiries
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-xs sm:text-sm">
            Payments
          </TabsTrigger>
          <TabsTrigger value="admins" className="text-xs sm:text-sm">
            Admins
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <RecentActivityFeed activities={recentActivities} />
        </TabsContent>

        {/* Hotel Bookings Tab */}
        <TabsContent value="hotels">
          <Card>
            <CardHeader>
              <CardTitle>Hotel Bookings</CardTitle>
              <CardDescription>Manage all hotel room bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {hotelBookings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No hotel bookings yet</p>
                  ) : (
                    hotelBookings.map((booking) => (
                      <Card key={booking.bookingId}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{booking.roomType}</CardTitle>
                              <CardDescription className="font-mono text-xs">
                                {booking.bookingId}
                              </CardDescription>
                            </div>
                            <StatusSelect
                              value={booking.status}
                              options={[
                                { value: BookingStatus.pending, label: 'Pending' },
                                { value: BookingStatus.confirmed, label: 'Confirmed' },
                                { value: BookingStatus.cancelled, label: 'Cancelled' },
                              ]}
                              onValueChange={(status) =>
                                handleHotelStatusChange(booking.bookingId, status, booking.roomType)
                              }
                              disabled={updateHotelStatus.isPending}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-muted-foreground">Check-in:</span>{' '}
                              <span className="font-medium">{formatDate(booking.checkInDate)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Check-out:</span>{' '}
                              <span className="font-medium">{formatDate(booking.checkOutDate)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Price:</span>{' '}
                              <span className="font-medium">{formatCurrency(Number(booking.totalPrice))}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Booked:</span>{' '}
                              <span className="font-medium">{formatDateTime(booking.bookingDate)}</span>
                            </div>
                          </div>
                          <Separator />
                          <div className="text-xs text-muted-foreground font-mono break-all">
                            Guest: {booking.guest.toString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cab Bookings Tab */}
        <TabsContent value="cabs">
          <Card>
            <CardHeader>
              <CardTitle>Cab Bookings</CardTitle>
              <CardDescription>Manage all cab service bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {cabBookings.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No cab bookings yet</p>
                  ) : (
                    cabBookings.map((booking) => (
                      <Card key={booking.bookingId}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{booking.cabType}</CardTitle>
                              <CardDescription className="font-mono text-xs">
                                {booking.bookingId}
                              </CardDescription>
                            </div>
                            <StatusSelect
                              value={booking.status}
                              options={[
                                { value: BookingStatus.pending, label: 'Pending' },
                                { value: BookingStatus.confirmed, label: 'Confirmed' },
                                { value: BookingStatus.cancelled, label: 'Cancelled' },
                              ]}
                              onValueChange={(status) =>
                                handleCabStatusChange(booking.bookingId, status, booking.cabType)
                              }
                              disabled={updateCabStatus.isPending}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-muted-foreground">Pickup:</span>{' '}
                              <span className="font-medium">{booking.pickupLocation}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Dropoff:</span>{' '}
                              <span className="font-medium">{booking.dropoffLocation}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Pickup Time:</span>{' '}
                              <span className="font-medium">{formatDateTime(booking.pickupTime)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Price:</span>{' '}
                              <span className="font-medium">{formatCurrency(Number(booking.totalPrice))}</span>
                            </div>
                          </div>
                          <Separator />
                          <div className="text-xs text-muted-foreground font-mono break-all">
                            Guest: {booking.guest.toString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Driver Requests Tab */}
        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle>Acting Driver Requests</CardTitle>
              <CardDescription>Manage all acting driver service requests</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {driverRequests.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No driver requests yet</p>
                  ) : (
                    driverRequests.map((request) => (
                      <Card key={request.requestId}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{request.vehicleType}</CardTitle>
                              <CardDescription className="font-mono text-xs">
                                {request.requestId}
                              </CardDescription>
                            </div>
                            <StatusSelect
                              value={request.status}
                              options={[
                                { value: BookingStatus.pending, label: 'Pending' },
                                { value: BookingStatus.confirmed, label: 'Confirmed' },
                                { value: BookingStatus.cancelled, label: 'Cancelled' },
                              ]}
                              onValueChange={(status) => handleDriverStatusChange(request.requestId, status)}
                              disabled={updateDriverStatus.isPending}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Service Date:</span>{' '}
                            <span className="font-medium">{formatDate(request.serviceDate)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Details:</span>{' '}
                            <p className="mt-1 text-foreground">{request.serviceDetails}</p>
                          </div>
                          <Separator />
                          <div className="text-xs text-muted-foreground font-mono break-all">
                            Guest: {request.guest.toString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sales Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Sales Orders</CardTitle>
              <CardDescription>Manage all product sales orders</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {salesOrders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No sales orders yet</p>
                  ) : (
                    salesOrders.map((order) => (
                      <Card key={order.orderId}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">
                                Order ({order.products.length} item{order.products.length !== 1 ? 's' : ''})
                              </CardTitle>
                              <CardDescription className="font-mono text-xs">{order.orderId}</CardDescription>
                            </div>
                            <StatusSelect
                              value={order.status}
                              options={[
                                { value: BookingStatus.pending, label: 'Pending' },
                                { value: BookingStatus.confirmed, label: 'Confirmed' },
                                { value: BookingStatus.cancelled, label: 'Cancelled' },
                              ]}
                              onValueChange={(status) => handleOrderStatusChange(order.orderId, status)}
                              disabled={updateOrderStatus.isPending}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-muted-foreground">Total:</span>{' '}
                              <span className="font-medium">{formatCurrency(Number(order.totalPrice))}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Order Date:</span>{' '}
                              <span className="font-medium">{formatDateTime(order.orderDate)}</span>
                            </div>
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Delivery:</span>{' '}
                              <span className="font-medium">{order.deliveryAddress}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Contact:</span>{' '}
                              <span className="font-medium">{order.contactNumber}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Email:</span>{' '}
                              <span className="font-medium">{order.email}</span>
                            </div>
                          </div>
                          <Separator />
                          <div className="text-xs text-muted-foreground font-mono break-all">
                            Customer: {order.customer.toString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inquiries Tab */}
        <TabsContent value="inquiries">
          <Card>
            <CardHeader>
              <CardTitle>Customer Inquiries</CardTitle>
              <CardDescription>Manage all customer support inquiries</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {inquiries.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No inquiries yet</p>
                  ) : (
                    inquiries.map((inquiry) => (
                      <Card key={inquiry.inquiryId}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">Inquiry</CardTitle>
                              <CardDescription className="font-mono text-xs">
                                {inquiry.inquiryId}
                              </CardDescription>
                            </div>
                            <StatusSelect
                              value={inquiry.status}
                              options={[
                                { value: Variant_new_closed_reviewed.new_, label: 'New' },
                                { value: Variant_new_closed_reviewed.reviewed, label: 'Reviewed' },
                                { value: Variant_new_closed_reviewed.closed, label: 'Closed' },
                              ]}
                              onValueChange={(status) => handleInquiryStatusChange(inquiry.inquiryId, status)}
                              disabled={updateInquiryStatus.isPending}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Message:</span>
                            <p className="mt-1 text-foreground">{inquiry.message}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Contact Info:</span>{' '}
                            <span className="font-medium">{inquiry.contactInfo}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Submitted:</span>{' '}
                            <span className="font-medium">{formatDateTime(inquiry.timestamp)}</span>
                          </div>
                          <Separator />
                          <div className="text-xs text-muted-foreground font-mono break-all">
                            Customer: {inquiry.customer.toString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Records</CardTitle>
              <CardDescription>Manage all payment submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-4">
                  {payments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No payment records yet</p>
                  ) : (
                    payments.map((payment) => (
                      <Card key={payment.paymentId}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">
                                {formatCurrency(Number(payment.amount))}
                              </CardTitle>
                              <CardDescription className="font-mono text-xs">
                                {payment.paymentId}
                              </CardDescription>
                            </div>
                            <StatusSelect
                              value={payment.status}
                              options={[
                                { value: Variant_new_verified_rejected.new_, label: 'New' },
                                { value: Variant_new_verified_rejected.verified, label: 'Verified' },
                                { value: Variant_new_verified_rejected.rejected, label: 'Rejected' },
                              ]}
                              onValueChange={(status) => handlePaymentStatusChange(payment.paymentId, status)}
                              disabled={updatePaymentStatus.isPending}
                            />
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Reference:</span>{' '}
                            <span className="font-medium">{payment.reference}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Note:</span>
                            <p className="mt-1 text-foreground">{payment.note}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Submitted:</span>{' '}
                            <span className="font-medium">{formatDateTime(payment.timestamp)}</span>
                          </div>
                          <Separator />
                          <div className="text-xs text-muted-foreground font-mono break-all">
                            Customer: {payment.customer.toString()}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Management Tab */}
        <TabsContent value="admins">
          <AdminManagementSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}
