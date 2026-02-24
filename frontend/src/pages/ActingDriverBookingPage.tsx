import { useState } from 'react';
import { useRequestActingDriver, useGetMyActingDriverRequests, useGetActingDriverBlockedDates } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CalendarIcon, CheckCircle2, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { dateToNanoseconds, formatDate } from '@/utils/format';
import { nanosToDate, normalizeToDay } from '@/utils/availability';
import AvailabilityLegend from '@/components/availability/AvailabilityLegend';

export default function ActingDriverBookingPage() {
  const { identity } = useInternetIdentity();
  const { data: myRequests } = useGetMyActingDriverRequests();
  const requestDriver = useRequestActingDriver();
  const { data: blockedServiceTimes = [] } = useGetActingDriverBlockedDates();

  const [vehicleType, setVehicleType] = useState('');
  const [serviceDetails, setServiceDetails] = useState('');
  const [serviceDate, setServiceDate] = useState<Date>();
  const [serviceTime, setServiceTime] = useState('09:00');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [requestId, setRequestId] = useState<string>('');

  const isAuthenticated = !!identity;

  // Convert blocked service times to dates for calendar
  const blockedDates = blockedServiceTimes.map(time => normalizeToDay(nanosToDate(time)));

  // Check if selected date is blocked
  const isSelectedDateBlocked = serviceDate && blockedDates.some(blocked => 
    normalizeToDay(serviceDate).getTime() === blocked.getTime()
  );

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to request a driver');
      return;
    }

    if (!vehicleType || !serviceDetails || !serviceDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isSelectedDateBlocked) {
      toast.error('Selected date is not available. Please choose a different date.');
      return;
    }

    try {
      const [hours, minutes] = serviceTime.split(':').map(Number);
      const serviceDateTime = new Date(serviceDate);
      serviceDateTime.setHours(hours, minutes, 0, 0);

      const id = await requestDriver.mutateAsync({
        vehicleType,
        serviceDetails,
        serviceDate: dateToNanoseconds(serviceDateTime),
      });
      setRequestId(id);
      setShowConfirmation(true);
      toast.success('Driver request submitted!');
      
      // Reset form
      setVehicleType('');
      setServiceDetails('');
      setServiceDate(undefined);
      setServiceTime('09:00');
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
              <p><strong>Request ID:</strong> {requestId}</p>
              <p><strong>Vehicle Type:</strong> {vehicleType}</p>
              <p><strong>Service Date:</strong> {serviceDate && format(serviceDate, 'PPP')} at {serviceTime}</p>
              <p><strong>Details:</strong> {serviceDetails}</p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                We will review your request and contact you shortly to confirm the details.
              </AlertDescription>
            </Alert>

            <Button onClick={() => setShowConfirmation(false)} className="w-full">
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div 
        className="relative py-12 px-4 bg-hero-image bg-overlay-subtle"
        style={{
          backgroundImage: 'url(/assets/generated/travel-bg-hero-couple.dim_1920x1080.jpg)'
        }}
      >
        <div className="container max-w-7xl mx-auto content-above-overlay">
          <h1 className="text-3xl font-bold mb-2">Acting Driver Service</h1>
          <p className="text-muted-foreground">Request a professional driver for your vehicle</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Request Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Request Acting Driver</CardTitle>
                <CardDescription>Fill in the details for your driver request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AvailabilityLegend />

                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Vehicle Type <span className="text-destructive">*</span></Label>
                  <Input
                    id="vehicleType"
                    placeholder="e.g., Sedan, SUV, Truck"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Service Date <span className="text-destructive">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {serviceDate ? format(serviceDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={serviceDate}
                        onSelect={setServiceDate}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (date < today) return true;
                          const normalizedDate = normalizeToDay(date);
                          return blockedDates.some(blocked => 
                            normalizedDate.getTime() === blocked.getTime()
                          );
                        }}
                        modifiers={{
                          blocked: (date) => {
                            const normalizedDate = normalizeToDay(date);
                            return blockedDates.some(blocked => 
                              normalizedDate.getTime() === blocked.getTime()
                            );
                          },
                        }}
                        modifiersClassNames={{
                          blocked: 'bg-destructive/10 text-destructive line-through opacity-50',
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceTime">Service Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="serviceTime"
                      type="time"
                      value={serviceTime}
                      onChange={(e) => setServiceTime(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Service Details <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="details"
                    placeholder="Describe your requirements (pickup location, destination, duration, etc.)"
                    value={serviceDetails}
                    onChange={(e) => setServiceDetails(e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                {isSelectedDateBlocked && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Selected date is not available. Please choose a different date.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleSubmit} 
                  disabled={!vehicleType || !serviceDetails || !serviceDate || requestDriver.isPending || !!isSelectedDateBlocked}
                  className="w-full"
                >
                  {requestDriver.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* My Requests */}
          <div>
            {isAuthenticated && myRequests && myRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>My Requests</CardTitle>
                  <CardDescription>Your driver request history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myRequests.map((request) => (
                      <div key={request.requestId} className="p-3 border rounded-lg space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{request.vehicleType}</p>
                            <p className="text-sm text-muted-foreground">{request.serviceDetails}</p>
                          </div>
                          <Badge variant={request.status === 'confirmed' ? 'default' : request.status === 'cancelled' ? 'destructive' : 'secondary'}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm">Service Date: {formatDate(request.serviceDate)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
