import { useState, useMemo } from 'react';
import { useGetCabTypes, useBookCab, useGetMyCabBookings, useGetCabAvailability, useGetCabBlockedDates } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CalendarIcon, CheckCircle2, Car, MapPin, Clock, Info } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { dateToNanoseconds, formatCurrency, formatDateTime } from '@/utils/format';
import { nanosToDate, normalizeToDay } from '@/utils/availability';
import AvailabilityLegend from '@/components/availability/AvailabilityLegend';
import type { CabType } from '../backend';

export default function CabBookingPage() {
  const { identity } = useInternetIdentity();
  const { data: cabTypes, isLoading } = useGetCabTypes();
  const { data: cabAvailability = [] } = useGetCabAvailability();
  const { data: myBookings } = useGetMyCabBookings();
  const bookCab = useBookCab();

  const [selectedCab, setSelectedCab] = useState<CabType | null>(null);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupDate, setPickupDate] = useState<Date>();
  const [pickupTime, setPickupTime] = useState('09:00');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');

  // Fetch blocked dates for the selected cab type
  const { data: blockedPickupTimes = [] } = useGetCabBlockedDates(selectedCab?.name || '');

  const isAuthenticated = !!identity;

  const availableCount = useMemo(() => {
    if (!selectedCab) return 0;
    const availability = cabAvailability.find(a => a.cabType === selectedCab.name);
    return availability ? Number(availability.availableCount) : 0;
  }, [selectedCab, cabAvailability]);

  // Convert blocked pickup times to dates for calendar
  const blockedDates = useMemo(() => {
    return blockedPickupTimes.map(time => normalizeToDay(nanosToDate(time)));
  }, [blockedPickupTimes]);

  // Check if selected date is blocked
  const isSelectedDateBlocked = useMemo(() => {
    if (!pickupDate || blockedDates.length === 0) return false;
    const normalizedPickup = normalizeToDay(pickupDate);
    return blockedDates.some(blocked => 
      normalizedPickup.getTime() === blocked.getTime()
    );
  }, [pickupDate, blockedDates]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book a cab');
      return;
    }

    if (!selectedCab || !pickupLocation || !dropoffLocation || !pickupDate) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isSelectedDateBlocked) {
      toast.error('Selected date is not available. Please choose a different date.');
      return;
    }

    if (availableCount === 0) {
      toast.error('No cabs available for the selected type');
      return;
    }

    try {
      const [hours, minutes] = pickupTime.split(':').map(Number);
      const pickupDateTime = new Date(pickupDate);
      pickupDateTime.setHours(hours, minutes, 0, 0);

      const id = await bookCab.mutateAsync({
        cabType: selectedCab.name,
        pickupLocation,
        dropoffLocation,
        pickupTime: dateToNanoseconds(pickupDateTime),
      });
      setBookingId(id);
      setShowConfirmation(true);
      toast.success('Cab booking confirmed!');
    } catch (error) {
      toast.error('Failed to book cab');
      console.error(error);
    }
  };

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
              <p><strong>Booking Reference:</strong> {bookingId}</p>
              <p><strong>Cab Type:</strong> {selectedCab?.name}</p>
              <p><strong>Pickup:</strong> {pickupLocation}</p>
              <p><strong>Dropoff:</strong> {dropoffLocation}</p>
              <p><strong>Pickup Time:</strong> {pickupDate && format(pickupDate, 'PPP')} at {pickupTime}</p>
              <p><strong>Total Price:</strong> {formatCurrency(Number(selectedCab?.offerPrice || 0))}</p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your booking is confirmed. The driver will contact you before the pickup time.
              </AlertDescription>
            </Alert>

            <Button onClick={() => { setShowConfirmation(false); setBookingId(''); }} className="w-full">
              Make Another Booking
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
          <h1 className="text-3xl font-bold mb-2">Cab Services</h1>
          <p className="text-muted-foreground">Book reliable transportation for your journey</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cab Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Vehicle Type</CardTitle>
                <CardDescription>Choose from our available vehicles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {cabTypes?.map((cab) => (
                    <CabCard 
                      key={cab.name} 
                      cab={cab} 
                      selected={selectedCab?.name === cab.name} 
                      onSelect={setSelectedCab}
                      availableCount={cabAvailability.find(a => a.cabType === cab.name)?.availableCount || 0n}
                    />
                  )) || <PlaceholderCab onSelect={setSelectedCab} />}
                </div>
              </CardContent>
            </Card>

            {/* My Bookings */}
            {isAuthenticated && myBookings && myBookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>My Cab Bookings</CardTitle>
                  <CardDescription>Your booking history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myBookings.map((booking) => (
                      <div key={booking.bookingId} className="p-3 border rounded-lg space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{booking.cabType}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.pickupLocation} → {booking.dropoffLocation}
                            </p>
                          </div>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'cancelled' ? 'destructive' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                        <p className="text-sm">Pickup: {formatDateTime(booking.pickupTime)}</p>
                        <p className="text-sm">Total: {formatCurrency(Number(booking.totalPrice))}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Your Ride</CardTitle>
                <CardDescription>Enter trip details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedCab && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{selectedCab.name}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(Number(selectedCab.pricePerTrip))}
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(Number(selectedCab.offerPrice))}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Available: {availableCount} {availableCount === 1 ? 'vehicle' : 'vehicles'}
                    </p>
                  </div>
                )}

                {selectedCab && <AvailabilityLegend />}

                <div className="space-y-2">
                  <Label htmlFor="pickup">Pickup Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="pickup"
                      placeholder="Enter pickup location"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dropoff">Dropoff Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dropoff"
                      placeholder="Enter dropoff location"
                      value={dropoffLocation}
                      onChange={(e) => setDropoffLocation(e.target.value)}
                      className="pl-9"
                    />
                  </div>
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
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={pickupDate}
                        onSelect={setPickupDate}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (date < today) return true;
                          if (!selectedCab) return false;
                          const normalizedDate = normalizeToDay(date);
                          return blockedDates.some(blocked => 
                            normalizedDate.getTime() === blocked.getTime()
                          );
                        }}
                        modifiers={{
                          blocked: (date) => {
                            if (!selectedCab) return false;
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
                  <Label htmlFor="time">Pickup Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {isSelectedDateBlocked && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Selected date is not available. Please choose a different date.
                    </AlertDescription>
                  </Alert>
                )}

                {availableCount === 0 && selectedCab && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      No vehicles available for this cab type.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleBooking} 
                  disabled={!selectedCab || !pickupLocation || !dropoffLocation || !pickupDate || bookCab.isPending || availableCount === 0 || isSelectedDateBlocked}
                  className="w-full"
                >
                  {bookCab.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function CabCard({ cab, selected, onSelect, availableCount }: { cab: CabType; selected: boolean; onSelect: (cab: CabType) => void; availableCount: bigint }) {
  return (
    <div
      onClick={() => onSelect(cab)}
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        selected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Car className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold">{cab.name}</h3>
            <p className="text-sm text-muted-foreground">Capacity: {Number(cab.capacity)} passengers</p>
            <p className="text-sm text-muted-foreground">Available: {Number(availableCount)}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground line-through">
            {formatCurrency(Number(cab.pricePerTrip))}
          </div>
          <div className="text-lg font-bold text-primary">
            {formatCurrency(Number(cab.offerPrice))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceholderCab({ onSelect }: { onSelect: (cab: CabType) => void }) {
  const placeholderCab: CabType = {
    name: 'Sedan',
    capacity: 4n,
    pricePerTrip: 2000n,
    offerPrice: 1800n,
    imageUrl: '',
  };

  return <CabCard cab={placeholderCab} selected={false} onSelect={onSelect} availableCount={5n} />;
}
