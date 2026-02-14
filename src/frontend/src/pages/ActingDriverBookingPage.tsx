import { useState } from 'react';
import { useRequestActingDriver, useGetMyActingDriverRequests } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { dateToNanoseconds, formatDateTime } from '@/utils/format';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

export default function ActingDriverBookingPage() {
  const { identity } = useInternetIdentity();
  const { data: myRequests } = useGetMyActingDriverRequests();
  const requestDriver = useRequestActingDriver();

  const [serviceDetails, setServiceDetails] = useState('');
  const [serviceDate, setServiceDate] = useState<Date>();
  const [serviceTime, setServiceTime] = useState('09:00');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isAuthenticated = !!identity;

  const handleRequest = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to request an acting driver');
      return;
    }

    if (!serviceDetails || !serviceDate) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const [hours, minutes] = serviceTime.split(':');
      const dateTime = new Date(serviceDate);
      dateTime.setHours(parseInt(hours), parseInt(minutes));

      await requestDriver.mutateAsync({
        serviceDetails,
        serviceDate: dateToNanoseconds(dateTime),
      });
      setShowConfirmation(true);
      setServiceDetails('');
      toast.success('Acting driver request submitted!');
    } catch (error) {
      toast.error('Failed to submit request');
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
            <CardTitle>Request Submitted!</CardTitle>
            <CardDescription>
              Your acting driver request has been successfully submitted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p><strong>Service Date:</strong> {serviceDate && format(serviceDate, 'PPP')} at {serviceTime}</p>
              <p><strong>Details:</strong> {serviceDetails}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
              <p className="text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> Email and WhatsApp notifications are not included in this version. 
                Our team will review your request and contact you through your registered contact information.
              </p>
            </div>
            <Button onClick={() => setShowConfirmation(false)} className="w-full">
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Acting Driver Service</h1>
        <p className="text-muted-foreground">Professional acting driver services for your convenience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Request Acting Driver</CardTitle>
              <CardDescription>Fill in the details for your service request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Service Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {serviceDate ? format(serviceDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={serviceDate} onSelect={setServiceDate} disabled={(date) => date < new Date()} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Service Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={serviceTime}
                  onChange={(e) => setServiceTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Service Details</Label>
                <Textarea
                  id="details"
                  value={serviceDetails}
                  onChange={(e) => setServiceDetails(e.target.value)}
                  placeholder="Describe your requirements (e.g., event type, duration, special instructions)"
                  rows={6}
                />
              </div>

              <Button onClick={handleRequest} disabled={requestDriver.isPending} className="w-full">
                {requestDriver.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>

              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground text-center">
                  Please sign in to submit a request
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Service Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">What We Offer</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Professional drivers</li>
                  <li>• Flexible scheduling</li>
                  <li>• Event coverage</li>
                  <li>• Corporate services</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">How It Works</h4>
                <ol className="space-y-1 text-muted-foreground list-decimal list-inside">
                  <li>Submit your request</li>
                  <li>We review and confirm</li>
                  <li>Driver assigned</li>
                  <li>Service delivered</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {isAuthenticated && myRequests && myRequests.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>My Requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myRequests.slice(0, 3).map((request) => (
                  <div key={request.requestId} className="rounded-lg border p-3 text-sm">
                    <p className="text-muted-foreground text-xs">{formatDateTime(request.serviceDate)}</p>
                    <p className="text-xs mt-1 line-clamp-2">{request.serviceDetails}</p>
                    <Badge variant={request.status === 'confirmed' ? 'default' : 'secondary'} className="mt-2">
                      {request.status}
                    </Badge>
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
