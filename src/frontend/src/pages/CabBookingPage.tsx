import { useState } from 'react';
import { useGetCabTypes, useBookCab, useGetMyCabBookings } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Users, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { dateToNanoseconds, formatCurrency, formatDateTime } from '@/utils/format';
import type { CabType } from '../backend';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

export default function CabBookingPage() {
  const { identity } = useInternetIdentity();
  const { data: cabTypes, isLoading } = useGetCabTypes();
  const { data: myBookings } = useGetMyCabBookings();
  const bookCab = useBookCab();

  const [selectedCab, setSelectedCab] = useState<CabType | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDate, setPickupDate] = useState<Date>();
  const [pickupTime, setPickupTime] = useState('09:00');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isAuthenticated = !!identity;

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book a cab');
      return;
    }

    if (!selectedCab || !pickupLocation || !dropoffLocation || !pickupDate) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const [hours, minutes] = pickupTime.split(':');
      const dateTime = new Date(pickupDate);
      dateTime.setHours(parseInt(hours), parseInt(minutes));

      await bookCab.mutateAsync({
        cabType: selectedCab.name,
        pickupLocation,
        dropoffLocation,
        pickupTime: dateToNanoseconds(dateTime),
      });
      setShowConfirmation(true);
      toast.success('Cab booking confirmed!');
    } catch (error) {
      toast.error('Failed to book cab');
      console.error(error);
    }
  };

  // Generate placeholder cab types if none exist
  const displayCabTypes = cabTypes && cabTypes.length > 0 ? cabTypes : [
    { name: 'Sedan (4-seater)', capacity: BigInt(4), pricePerTrip: BigInt(50), imageUrl: '' },
    { name: 'SUV (7-seater)', capacity: BigInt(7), pricePerTrip: BigInt(80), imageUrl: '' },
    { name: 'Van (12-seater)', capacity: BigInt(12), pricePerTrip: BigInt(120), imageUrl: '' },
    { name: 'Minibus (18-seater)', capacity: BigInt(18), pricePerTrip: BigInt(180), imageUrl: '' },
    { name: 'Bus (22-seater)', capacity: BigInt(22), pricePerTrip: BigInt(220), imageUrl: '' },
  ];

  if (isLoading) {
    return (
      <div className="container py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="container py-16 max-w-2xl">
        <Card className="border-green-500/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <CardTitle>Cab Booking Confirmed!</CardTitle>
            <CardDescription>
              Your cab has been successfully booked
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p><strong>Vehicle:</strong> {selectedCab?.name}</p>
              <p><strong>Pickup:</strong> {pickupLocation}</p>
              <p><strong>Drop-off:</strong> {dropoffLocation}</p>
              <p><strong>Date & Time:</strong> {pickupDate && format(pickupDate, 'PPP')} at {pickupTime}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
              <p className="text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> Email and WhatsApp notifications are not included in this version. 
                Please check your bookings in your account or contact support for updates.
              </p>
            </div>
            <Button onClick={() => setShowConfirmation(false)} className="w-full">
              Make Another Booking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cab Booking</h1>
        <p className="text-muted-foreground">Book reliable transportation from 4 to 22 seaters</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vehicle Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Select Vehicle</CardTitle>
              <CardDescription>Choose the right vehicle for your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayCabTypes.map((cab) => (
                  <Card
                    key={cab.name}
                    className={`cursor-pointer transition-all ${selectedCab?.name === cab.name ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedCab(cab)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{cab.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <Users className="h-4 w-4" />
                            <span>{cab.capacity.toString()} seats</span>
                          </div>
                        </div>
                        {selectedCab?.name === cab.name && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      </div>
                      <p className="text-xl font-bold text-primary">{formatCurrency(cab.pricePerTrip)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pickup">Pickup Location</Label>
                <Input
                  id="pickup"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="Enter pickup address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dropoff">Drop-off Location</Label>
                <Input
                  id="dropoff"
                  value={dropoffLocation}
                  onChange={(e) => setDropoffLocation(e.target.value)}
                  placeholder="Enter drop-off address"
                />
              </div>

              <div className="space-y-2">
                <Label>Pickup Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {pickupDate ? format(pickupDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={pickupDate} onSelect={setPickupDate} disabled={(date) => date < new Date()} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Pickup Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                />
              </div>

              {selectedCab && (
                <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                  <p className="font-medium">{selectedCab.name}</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(selectedCab.pricePerTrip)}</p>
                </div>
              )}

              <Button onClick={handleBooking} disabled={bookCab.isPending || !selectedCab} className="w-full">
                {bookCab.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>

              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground text-center">
                  Please sign in to complete your booking
                </p>
              )}
            </CardContent>
          </Card>

          {/* My Bookings */}
          {isAuthenticated && myBookings && myBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {myBookings.slice(0, 3).map((booking) => (
                  <div key={booking.bookingId} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{booking.cabType}</p>
                    <p className="text-muted-foreground text-xs">{booking.pickupLocation} → {booking.dropoffLocation}</p>
                    <p className="text-muted-foreground text-xs">{formatDateTime(booking.pickupTime)}</p>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'} className="mt-2">
                      {booking.status}
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
