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
} from '@/hooks/useOwnerRecords';
import { formatDate, formatDateTime, formatCurrency } from '@/utils/format';
import { Variant_new_closed_reviewed, Variant_new_verified_rejected } from '../backend';

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

  const [selectedTab, setSelectedTab] = useState('overview');

  const stats = [
    { label: 'Hotel Bookings', value: hotelBookings.length, icon: Hotel, color: 'text-blue-500' },
    { label: 'Cab Bookings', value: cabBookings.length, icon: Car, color: 'text-green-500' },
    { label: 'Driver Requests', value: driverRequests.length, icon: UserCircle, color: 'text-purple-500' },
    { label: 'Sales Orders', value: salesOrders.length, icon: ShoppingBag, color: 'text-orange-500' },
    { label: 'Inquiries', value: inquiries.length, icon: MessageSquare, color: 'text-red-500' },
    { label: 'Payments', value: payments.length, icon: CreditCard, color: 'text-indigo-500' },
  ];

  // Create a unified activity feed with proper type handling
  const recentActivity = [
    ...hotelBookings.map(b => ({ type: 'hotel' as const, data: b, timestamp: b.bookingDate })),
    ...cabBookings.map(b => ({ type: 'cab' as const, data: b, timestamp: b.bookingDate })),
    ...salesOrders.map(o => ({ type: 'order' as const, data: o, timestamp: o.orderDate })),
  ]
    .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
    .slice(0, 10);

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Owner Dashboard</h1>
        <p className="text-muted-foreground">Manage all bookings, orders, and inquiries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <CardHeader>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="hotels">Hotels</TabsTrigger>
              <TabsTrigger value="cabs">Cabs</TabsTrigger>
              <TabsTrigger value="drivers">Drivers</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
          </CardHeader>

          <CardContent>
            <TabsContent value="overview" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {recentActivity.map((item, i) => (
                      <div key={i} className="rounded-lg border p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {item.type === 'hotel' 
                                ? `Hotel: ${item.data.roomType}` 
                                : item.type === 'cab' 
                                ? `Cab: ${item.data.cabType}` 
                                : `Order: ${item.data.orderId}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateTime(item.timestamp)}
                            </p>
                          </div>
                          <Badge>{item.data.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="hotels">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {hotelBookings.map((booking) => (
                    <div key={booking.bookingId} className="rounded-lg border p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{booking.roomType}</p>
                          <p className="text-sm text-muted-foreground">ID: {booking.bookingId}</p>
                        </div>
                        <Badge>{booking.status}</Badge>
                      </div>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Check-in</p>
                          <p>{formatDate(booking.checkInDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Check-out</p>
                          <p>{formatDate(booking.checkOutDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-bold">{formatCurrency(booking.totalPrice)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Booked</p>
                          <p>{formatDate(booking.bookingDate)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="cabs">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {cabBookings.map((booking) => (
                    <div key={booking.bookingId} className="rounded-lg border p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{booking.cabType}</p>
                          <p className="text-sm text-muted-foreground">ID: {booking.bookingId}</p>
                        </div>
                        <Badge>{booking.status}</Badge>
                      </div>
                      <Separator className="my-2" />
                      <div className="space-y-1 text-sm">
                        <p><strong>Pickup:</strong> {booking.pickupLocation}</p>
                        <p><strong>Drop-off:</strong> {booking.dropoffLocation}</p>
                        <p><strong>Time:</strong> {formatDateTime(booking.pickupTime)}</p>
                        <p><strong>Total:</strong> <span className="font-bold">{formatCurrency(booking.totalPrice)}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="drivers">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {driverRequests.map((request) => (
                    <div key={request.requestId} className="rounded-lg border p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Acting Driver Request</p>
                          <p className="text-sm text-muted-foreground">ID: {request.requestId}</p>
                        </div>
                        <Badge>{request.status}</Badge>
                      </div>
                      <Separator className="my-2" />
                      <div className="space-y-1 text-sm">
                        <p><strong>Service Date:</strong> {formatDateTime(request.serviceDate)}</p>
                        <p><strong>Details:</strong> {request.serviceDetails}</p>
                        <p><strong>Requested:</strong> {formatDate(request.bookingDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="orders">
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {salesOrders.map((order) => (
                    <div key={order.orderId} className="rounded-lg border p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Order #{order.orderId}</p>
                          <p className="text-sm text-muted-foreground">{order.products.length} items</p>
                        </div>
                        <Badge>{order.status}</Badge>
                      </div>
                      <Separator className="my-2" />
                      <div className="space-y-1 text-sm">
                        <p><strong>Customer:</strong> {order.email}</p>
                        <p><strong>Contact:</strong> {order.contactNumber}</p>
                        <p><strong>Address:</strong> {order.deliveryAddress}</p>
                        <p><strong>Total:</strong> <span className="font-bold">{formatCurrency(order.totalPrice)}</span></p>
                        <p><strong>Ordered:</strong> {formatDate(order.orderDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="support">
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Customer Inquiries</h3>
                    <div className="space-y-3">
                      {inquiries.map((inquiry) => (
                        <div key={inquiry.inquiryId} className="rounded-lg border p-4">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-muted-foreground">{formatDateTime(inquiry.timestamp)}</p>
                            <Badge variant={inquiry.status === Variant_new_closed_reviewed.new_ ? 'default' : 'secondary'}>
                              {inquiry.status === Variant_new_closed_reviewed.new_ ? 'New' : inquiry.status}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{inquiry.message}</p>
                          <p className="text-xs text-muted-foreground">Contact: {inquiry.contactInfo}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold mb-3">Payment Records</h3>
                    <div className="space-y-3">
                      {payments.map((payment) => (
                        <div key={payment.paymentId} className="rounded-lg border p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{payment.reference}</p>
                              <p className="text-sm text-muted-foreground">{formatDateTime(payment.timestamp)}</p>
                            </div>
                            <Badge variant={payment.status === Variant_new_verified_rejected.verified ? 'default' : payment.status === Variant_new_verified_rejected.rejected ? 'destructive' : 'secondary'}>
                              {payment.status === Variant_new_verified_rejected.new_ ? 'Pending' : payment.status}
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-primary">{formatCurrency(Number(payment.amount) / 100)}</p>
                          {payment.note && <p className="text-sm text-muted-foreground mt-1">{payment.note}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}
