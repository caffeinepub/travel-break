import { useState } from 'react';
import { useGetMySalesOrders, useUpdateSalesOrderDate, useCancelSalesOrder } from '@/hooks/useQueries';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatDate, formatCurrency, dateToNanoseconds } from '@/utils/format';
import { ShoppingBag, Package, AlertCircle, CalendarIcon, Loader2, XCircle } from 'lucide-react';
import { BookingStatus, PaymentPlan } from '@/backend';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function OrderHistoryPage() {
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading } = useGetMySalesOrders();
  const updateDateMutation = useUpdateSalesOrderDate();
  const cancelOrderMutation = useCancelSalesOrder();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);

  const isAuthenticated = !!identity;

  const getStatusBadgeVariant = (status: BookingStatus): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case BookingStatus.confirmed:
        return 'default';
      case BookingStatus.pending:
        return 'secondary';
      case BookingStatus.cancelled:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.confirmed:
        return 'Confirmed';
      case BookingStatus.pending:
        return 'Pending';
      case BookingStatus.cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  const getPaymentPlanLabel = (plan: PaymentPlan): string => {
    switch (plan) {
      case PaymentPlan.fullUpfront:
        return 'Full Payment';
      case PaymentPlan.partialUpfront:
        return '40% Upfront + COD';
      case PaymentPlan.cod:
        return 'Cash on Delivery';
      case PaymentPlan.depositRequired:
        return 'Deposit Required';
      default:
        return 'Unknown';
    }
  };

  const handleDateChange = async (orderId: string, date: Date | undefined) => {
    if (!date) return;

    try {
      const newDateNano = dateToNanoseconds(date);
      await updateDateMutation.mutateAsync({ orderId, newDate: newDateNano });
      toast.success('Order date updated successfully');
      setEditingOrderId(null);
      setSelectedDate(undefined);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update order date');
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to cancel this order? This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await cancelOrderMutation.mutateAsync(orderId);
      toast.success('Order cancelled successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order');
    }
  };

  const isPending = (status: BookingStatus) => status === BookingStatus.pending;

  if (!isAuthenticated) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-2xl">Sign In Required</CardTitle>
            <CardDescription className="text-base">
              Please sign in to view your order history
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">No Orders Yet</CardTitle>
            <CardDescription className="text-base">
              You haven't placed any orders yet. Visit our store to start shopping!
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 bg-clip-text text-transparent">
          Order History
        </h1>
        <p className="text-muted-foreground">
          View and track all your orders
        </p>
      </div>

      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.orderId} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Order #{order.orderId}</CardTitle>
                      <CardDescription>
                        Placed on {formatDate(order.orderDate)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Products</h3>
                      <div className="space-y-2">
                        {order.products.map((product, idx) => (
                          <div key={idx} className="flex justify-between items-start text-sm">
                            <span className="flex-1">{product.name}</span>
                            <span className="font-medium">{formatCurrency(product.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Delivery Address</h3>
                      <p className="text-sm">{order.deliveryAddress}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Contact</h3>
                      <p className="text-sm">{order.contactNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground">Payment Details</h3>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Payment Plan</span>
                        <Badge variant="outline">{getPaymentPlanLabel(order.paymentPlan)}</Badge>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Total Amount</span>
                          <span className="font-semibold">{formatCurrency(order.totalPrice)}</span>
                        </div>

                        {order.upfrontAmount > 0n && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Upfront Payment</span>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {formatCurrency(order.upfrontAmount)}
                            </span>
                          </div>
                        )}

                        {order.remainingAmount > 0n && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                              {order.paymentPlan === PaymentPlan.partialUpfront ? 'COD Amount' : 'Remaining'}
                            </span>
                            <span className="text-orange-600 dark:text-orange-400 font-medium">
                              {formatCurrency(order.remainingAmount)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground">Actions</h3>
                      
                      {isPending(order.status) ? (
                        <div className="space-y-2">
                          {/* Modify Date */}
                          <div className="flex flex-col gap-2">
                            <Label className="text-xs">Modify Order Date</Label>
                            <Popover
                              open={editingOrderId === order.orderId}
                              onOpenChange={(open) => {
                                if (open) {
                                  setEditingOrderId(order.orderId);
                                  setSelectedDate(undefined);
                                } else {
                                  setEditingOrderId(null);
                                  setSelectedDate(undefined);
                                }
                              }}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-left font-normal"
                                  disabled={updateDateMutation.isPending}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {selectedDate && editingOrderId === order.orderId
                                    ? format(selectedDate, 'PPP')
                                    : 'Select new date'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  onSelect={(date) => {
                                    setSelectedDate(date);
                                    if (date) {
                                      handleDateChange(order.orderId, date);
                                    }
                                  }}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <Separator />

                          {/* Cancel Order */}
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={() => handleCancelOrder(order.orderId)}
                            disabled={cancelOrderMutation.isPending}
                          >
                            {cancelOrderMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Order
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Actions are available only for pending orders.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
