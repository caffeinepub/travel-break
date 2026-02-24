import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CheckCircle2, XCircle, Loader2, Package } from 'lucide-react';
import { useGetAllSalesOrders, useUpdateSalesOrderStatus } from '@/hooks/useOwnerRecords';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { BookingStatus } from '@/backend';
import { toast } from 'sonner';

export default function OrderManagementSection() {
  const { data: orders = [], isLoading } = useGetAllSalesOrders();
  const updateStatus = useUpdateSalesOrderStatus();
  const [confirmDialog, setConfirmDialog] = useState<{ orderId: string; status: BookingStatus; action: string } | null>(null);

  const handleStatusUpdate = async (orderId: string, status: BookingStatus, action: string) => {
    setConfirmDialog({ orderId, status, action });
  };

  const confirmStatusUpdate = async () => {
    if (!confirmDialog) return;

    try {
      await updateStatus.mutateAsync({
        orderId: confirmDialog.orderId,
        status: confirmDialog.status,
      });
      toast.success(`Order ${confirmDialog.action.toLowerCase()} successfully`);
      setConfirmDialog(null);
    } catch (error) {
      toast.error(`Failed to ${confirmDialog.action.toLowerCase()} order`);
      console.error(error);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.confirmed:
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Accepted</Badge>;
      case BookingStatus.cancelled:
        return <Badge variant="destructive">Rejected</Badge>;
      case BookingStatus.pending:
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Management
          </CardTitle>
          <CardDescription>Manage sales orders and update their status</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Management
          </CardTitle>
          <CardDescription>Manage sales orders and update their status</CardDescription>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders found</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.orderId}>
                      <TableCell className="font-mono text-xs">{order.orderId.slice(0, 12)}...</TableCell>
                      <TableCell className="font-mono text-xs">{order.customer.toString().slice(0, 12)}...</TableCell>
                      <TableCell className="text-sm">{formatDateTime(order.orderDate)}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(order.totalPrice)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {order.paymentPlan === 'fullUpfront' && 'Full Payment'}
                          {order.paymentPlan === 'partialUpfront' && '40% Upfront'}
                          {order.paymentPlan === 'cod' && 'Cash on Delivery'}
                          {order.paymentPlan === 'depositRequired' && 'Deposit Required'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        {order.status === BookingStatus.pending ? (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleStatusUpdate(order.orderId, BookingStatus.confirmed, 'Accept')}
                              disabled={updateStatus.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleStatusUpdate(order.orderId, BookingStatus.cancelled, 'Reject')}
                              disabled={updateStatus.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No actions</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm {confirmDialog?.action}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmDialog?.action.toLowerCase()} this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateStatus.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusUpdate} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Confirm ${confirmDialog?.action}`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
