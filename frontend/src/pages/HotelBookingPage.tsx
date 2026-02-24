import { useState, useMemo } from 'react';
import { useGetRoomTypes, useBookHotel, useGetMyHotelBookings, useGetRoomAvailability } from '@/hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CalendarIcon, CheckCircle2, Star, Info, ArrowRight } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { dateToNanoseconds, formatCurrency, formatDate } from '@/utils/format';
import { getAverageRating, getRoomTypeRating } from '@/data/hotelReviews';
import { useNavigate } from '@tanstack/react-router';
import { isDateBlocked, getBlockedDatesFromRanges, doesRangeOverlap } from '@/utils/availability';
import AvailabilityLegend from '@/components/availability/AvailabilityLegend';
import type { RoomType } from '../backend';

export default function HotelBookingPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: roomTypes, isLoading } = useGetRoomTypes();
  const { data: myBookings } = useGetMyHotelBookings();
  const bookHotel = useBookHotel();

  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');

  // Fetch blocked dates for the selected room type
  const { data: blockedRanges = [] } = useGetRoomAvailability(selectedRoom?.name || '');

  const isAuthenticated = !!identity;
  const averageRating = getAverageRating();

  const numberOfNights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return differenceInDays(checkOut, checkIn);
  }, [checkIn, checkOut]);

  const totalPrice = useMemo(() => {
    if (!selectedRoom || numberOfNights <= 0) return 0;
    return Number(selectedRoom.offerPrice) * numberOfNights;
  }, [selectedRoom, numberOfNights]);

  const depositAmount = useMemo(() => {
    return Math.round(totalPrice * 0.1);
  }, [totalPrice]);

  const remainingAmount = useMemo(() => {
    return totalPrice - depositAmount;
  }, [totalPrice, depositAmount]);

  // Check if selected dates overlap with blocked ranges
  const hasDateConflict = useMemo(() => {
    if (!checkIn || !checkOut || blockedRanges.length === 0) return false;
    return doesRangeOverlap(checkIn, checkOut, blockedRanges);
  }, [checkIn, checkOut, blockedRanges]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to book a room');
      return;
    }

    if (!selectedRoom || !checkIn || !checkOut) {
      toast.error('Please select room type and dates');
      return;
    }

    if (hasDateConflict) {
      toast.error('Selected dates are not available. Please choose different dates.');
      return;
    }

    try {
      const id = await bookHotel.mutateAsync({
        roomType: selectedRoom.name,
        checkInDate: dateToNanoseconds(checkIn),
        checkOutDate: dateToNanoseconds(checkOut),
      });
      setBookingId(id);
      setShowConfirmation(true);
      toast.success('Booking confirmed!');
    } catch (error) {
      toast.error('Failed to book room');
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
            <CardTitle>Booking Confirmed!</CardTitle>
            <CardDescription>
              Your hotel booking has been successfully submitted
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-2">
              <p><strong>Booking Reference:</strong> {bookingId}</p>
              <p><strong>Room:</strong> {selectedRoom?.name}</p>
              <p><strong>Check-in:</strong> {checkIn && format(checkIn, 'PPP')}</p>
              <p><strong>Check-out:</strong> {checkOut && format(checkOut, 'PPP')}</p>
              <p><strong>Nights:</strong> {numberOfNights}</p>
            </div>

            <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
              <p className="font-semibold mb-2">Payment Summary</p>
              <div className="flex justify-between text-sm">
                <span>Total Amount:</span>
                <span className="font-medium">{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Deposit (10%):</span>
                <span className="font-medium text-primary">{formatCurrency(depositAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Remaining Amount:</span>
                <span className="font-medium">{formatCurrency(remainingAmount)}</span>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Step:</strong> To confirm your booking, please submit a payment record for the deposit amount of <strong>{formatCurrency(depositAmount)}</strong> on the Payment Receiving page. Use the booking reference <strong>{bookingId}</strong> when submitting your payment record.
              </AlertDescription>
            </Alert>

            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm">
              <p className="text-blue-900 dark:text-blue-100">
                <strong>Note:</strong> This system records payment information only. No actual payment processing occurs. Email and WhatsApp notifications are not included in this version.
              </p>
            </div>
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
      {/* Header with Background Image */}
      <div 
        className="relative py-12 px-4 bg-hero-image bg-overlay-subtle"
        style={{
          backgroundImage: 'url(/assets/generated/travel-bg-resort-view-1.dim_1920x1080.jpg)'
        }}
      >
        <div className="container max-w-7xl mx-auto content-above-overlay">
          <h1 className="text-3xl font-bold mb-2">Hotels & Stays</h1>
          <p className="text-muted-foreground">Book your perfect accommodation</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Room Type</CardTitle>
                <CardDescription>Choose from our available rooms</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="deluxe" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="deluxe">Deluxe</TabsTrigger>
                    <TabsTrigger value="suite">Suite</TabsTrigger>
                    <TabsTrigger value="cottage">Cottage</TabsTrigger>
                  </TabsList>
                  <TabsContent value="deluxe" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      {roomTypes?.filter(r => r.name.toLowerCase().includes('deluxe')).map((room) => (
                        <RoomCard key={room.name} room={room} selected={selectedRoom?.name === room.name} onSelect={setSelectedRoom} />
                      )) || <PlaceholderRoom type="Deluxe Room" onSelect={setSelectedRoom} />}
                    </div>
                  </TabsContent>
                  <TabsContent value="suite" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      {roomTypes?.filter(r => r.name.toLowerCase().includes('suite')).map((room) => (
                        <RoomCard key={room.name} room={room} selected={selectedRoom?.name === room.name} onSelect={setSelectedRoom} />
                      )) || <PlaceholderRoom type="Executive Suite" onSelect={setSelectedRoom} />}
                    </div>
                  </TabsContent>
                  <TabsContent value="cottage" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      {roomTypes?.filter(r => r.name.toLowerCase().includes('cottage')).map((room) => (
                        <RoomCard key={room.name} room={room} selected={selectedRoom?.name === room.name} onSelect={setSelectedRoom} />
                      )) || <PlaceholderRoom type="Garden Cottage" onSelect={setSelectedRoom} />}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Guest Reviews Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Guest Reviews</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-foreground">{averageRating}</span>
                      </div>
                      <span>Overall rating from our guests</span>
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate({ to: '/hotel-reviews' })}>
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* My Bookings */}
            {isAuthenticated && myBookings && myBookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>My Bookings</CardTitle>
                  <CardDescription>Your hotel booking history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {myBookings.map((booking) => (
                      <div key={booking.bookingId} className="p-3 border rounded-lg space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{booking.roomType}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                            </p>
                          </div>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : booking.status === 'cancelled' ? 'destructive' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
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
                <CardTitle>Book Your Stay</CardTitle>
                <CardDescription>Select dates and confirm booking</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRoom && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{selectedRoom.name}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm text-muted-foreground line-through">
                        {formatCurrency(Number(selectedRoom.pricePerNight))}/night
                      </span>
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(Number(selectedRoom.offerPrice))}/night
                      </span>
                    </div>
                  </div>
                )}

                {selectedRoom && <AvailabilityLegend />}

                <div className="space-y-2">
                  <Label>Check-in Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkIn ? format(checkIn, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={setCheckIn}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          if (date < today) return true;
                          if (!selectedRoom) return false;
                          return isDateBlocked(date, blockedRanges);
                        }}
                        modifiers={{
                          blocked: (date) => selectedRoom ? isDateBlocked(date, blockedRanges) : false,
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
                  <Label>Check-out Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOut ? format(checkOut, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        disabled={(date) => {
                          if (!checkIn) return true;
                          if (date <= checkIn) return true;
                          if (!selectedRoom) return false;
                          return isDateBlocked(date, blockedRanges);
                        }}
                        modifiers={{
                          blocked: (date) => selectedRoom ? isDateBlocked(date, blockedRanges) : false,
                        }}
                        modifiersClassNames={{
                          blocked: 'bg-destructive/10 text-destructive line-through opacity-50',
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {hasDateConflict && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Selected dates overlap with existing bookings. Please choose different dates.
                    </AlertDescription>
                  </Alert>
                )}

                {numberOfNights > 0 && !hasDateConflict && (
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Nights:</span>
                      <span className="font-medium">{numberOfNights}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Price per night:</span>
                      <span className="font-medium">{formatCurrency(Number(selectedRoom?.offerPrice || 0))}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Total:</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Deposit (10%):</span>
                      <span>{formatCurrency(depositAmount)}</span>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={handleBooking} 
                  disabled={!selectedRoom || !checkIn || !checkOut || bookHotel.isPending || hasDateConflict}
                  className="w-full"
                >
                  {bookHotel.isPending ? (
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

function RoomCard({ room, selected, onSelect }: { room: RoomType; selected: boolean; onSelect: (room: RoomType) => void }) {
  const roomRating = getRoomTypeRating(room.name);
  
  return (
    <div
      onClick={() => onSelect(room)}
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        selected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold">{room.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-muted-foreground">{roomRating}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground line-through">
            {formatCurrency(Number(room.pricePerNight))}/night
          </div>
          <div className="text-lg font-bold text-primary">
            {formatCurrency(Number(room.offerPrice))}/night
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {room.features.map((feature, idx) => (
          <Badge key={idx} variant="secondary" className="text-xs">
            {feature}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function PlaceholderRoom({ type, onSelect }: { type: string; onSelect: (room: RoomType) => void }) {
  const placeholderRoom: RoomType = {
    name: type,
    features: ['WiFi', 'AC', 'TV'],
    pricePerNight: 5000n,
    offerPrice: 4500n,
    imageUrls: [],
  };

  return <RoomCard room={placeholderRoom} selected={false} onSelect={onSelect} />;
}
