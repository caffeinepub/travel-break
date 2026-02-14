import { useState } from 'react';
import { useSubmitPayment, useGetMyPayments } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { formatCurrency, formatDateTime } from '@/utils/format';
import { Variant_new_verified_rejected } from '../backend';

export default function PaymentReceivingPage() {
  const { identity } = useInternetIdentity();
  const { data: myPayments } = useGetMyPayments();
  const submitPayment = useSubmitPayment();

  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isAuthenticated = !!identity;

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to submit a payment');
      return;
    }

    if (!reference || !amount) {
      toast.error('Please fill in reference and amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await submitPayment.mutateAsync({
        reference,
        note,
        amount: BigInt(Math.round(amountNum * 100)),
      });
      setShowConfirmation(true);
      setReference('');
      setNote('');
      setAmount('');
      toast.success('Payment record submitted!');
    } catch (error) {
      toast.error('Failed to submit payment');
      console.error(error);
    }
  };

  if (showConfirmation) {
    return (
      <div className="container py-16 max-w-2xl">
        <Card className="border-green-500/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle>Payment Record Submitted!</CardTitle>
            <CardDescription>
              Your payment information has been recorded
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p><strong>Reference:</strong> {reference}</p>
              <p><strong>Amount:</strong> {formatCurrency(parseFloat(amount))}</p>
              {note && <p><strong>Note:</strong> {note}</p>}
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
              <p className="text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> Email and WhatsApp notifications are not included in this version. 
                Our team will review your payment record and update the status accordingly.
              </p>
            </div>
            <Button onClick={() => setShowConfirmation(false)} className="w-full">
              Submit Another Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Receiving</h1>
        <p className="text-muted-foreground">Submit your payment information for verification</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Submit Payment Record</CardTitle>
              <CardDescription>Enter your payment details for our records</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Booking/Order Reference *</Label>
                <Input
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g., hotel-123456 or order-789012"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Payment Note</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add any additional information (e.g., transaction ID, payment method)"
                  rows={4}
                />
              </div>

              <Button onClick={handleSubmit} disabled={submitPayment.isPending} className="w-full">
                {submitPayment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Submit Payment Record
                  </>
                )}
              </Button>

              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground text-center">
                  Please sign in to submit a payment record
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Important Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                This form is for recording payment information only. No actual payment processing occurs here.
              </p>
              <p className="text-muted-foreground">
                Please ensure your booking/order reference is correct for proper tracking.
              </p>
              <p className="text-muted-foreground">
                Our team will verify your payment and update your booking/order status accordingly.
              </p>
            </CardContent>
          </Card>

          {isAuthenticated && myPayments && myPayments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>My Payment Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myPayments.slice(0, 5).map((payment) => (
                  <div key={payment.paymentId} className="rounded-lg border p-3 text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium">{payment.reference}</p>
                      <Badge variant={payment.status === Variant_new_verified_rejected.verified ? 'default' : payment.status === Variant_new_verified_rejected.rejected ? 'destructive' : 'secondary'}>
                        {payment.status === Variant_new_verified_rejected.new_ ? 'Pending' : payment.status}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold text-primary">{formatCurrency(Number(payment.amount) / 100)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDateTime(payment.timestamp)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
